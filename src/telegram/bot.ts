//#region imports
import {
	Bot,
	Context,
	Enhance,
	enhanceStorage,
	lazySession,
	LazySessionFlavor,
	MiddlewareFn,
	SessionFlavor,
} from "grammy";
import { menus } from "./menus";
import { shortiesIDs } from "../data/poemsIDs";
import { rand, shuffleArray } from "../utils/utils";
import { MenuFlavor } from "@grammyjs/menu";
import { D1Adapter, KvAdapter } from "@grammyjs/storage-cloudflare";
import { Env, Mixin, SessionData_v1 } from "../main";
import { updateUserSubscribeHour } from "../lib/database/kv";
import { commands, CommandsFlavor } from "@grammyjs/commands";
import { userCommands } from "./commands";
import { addNewPoems, reorganizeSections } from "./migrations";
//#endregion

// should separate context's, since, for ex, MenuFlavor is not used outside it's scope
export type Lezama =
	& Context
	& LazySessionFlavor<SessionData_v1>
	& MenuFlavor
	& CommandsFlavor<Lezama>
	& Mixin;

async function getBot(env: Env) {
	const bot = new Bot<Lezama>(env.BOT_TOKEN, {
		botInfo: JSON.parse(env.BOT_INFO),
	});
	const sessionsDB = await D1Adapter.create<Enhance<SessionData_v1>>(
		env.D1_LEZAMA,
		"sessions",
	);

	// middleware install, be careful, order matters.

	bot.use(async (c, next) => {
		c.env = env;
		c.kv = new KvAdapter(env.KV_LEZAMA);
		await next();
	});

	bot.use(lazySession({
		initial: () =>
			({
				chatID: 0,
				poems: {
					all: shortiesIDs,
					queue: shuffleArray(shortiesIDs),
					visited: [],
					includeMiddies: false,
				},
				cron: {
					hour: rand(24),
					minute: 0,
					timezoneOffset: -4,
				},
				subscribed: false,
			}) as SessionData_v1,
		storage: enhanceStorage({
			storage: sessionsDB,
			migrations: {
				1: reorganizeSections,
				2: addNewPoems,
			},
		}),
	}));

	bot.use(commands());

	// menu install
	menus.forEach((menu) => bot.use(menu.menu));

	// commands install
	bot.use(userCommands);
	await userCommands.setCommands(bot);

	// Should be a conversation
	bot.hears(
		/^(GMT|UTC|gmt|utc)([+-][0-9]|[+-]1[0-2]|[+]1[2-4])$/,
		async (c) => {
			const session = await c.session;
			const offset = c.message?.text?.slice(3);
			if (offset) {
				const oldCronHour = session.cron.hour;
				const oldRawHour = oldCronHour + session.cron.timezoneOffset;

				session.cron.timezoneOffset = +offset;
				session.cron.hour = oldRawHour - (+offset);

				await updateUserSubscribeHour(
					c,
					`${session.chatID}`,
					oldCronHour,
					session.cron.hour,
				);

				await c.reply("Cambio de huso horario exitoso a UTC" + offset);
			}
		},
	);

	bot.command("usercount", async (c: Lezama, next) => {
		const session = await c.session;
		if (`${(c.chat?.id || session.chatID)}` === c.env.DEVELOPER_ID) {
			let count = 0;
			for await (const hour of c.kv.readAllKeys()) {
				const hourObj = await c.kv.read(hour);
				for (const user in hourObj) {
					count++;
				}
			}
			await c.reply("", {});
		} else {
			await next();
		}
	});

	// nothing else matched
	bot.on("msg:text", (c) => {
		if (c.from?.id !== +c.env.DEVELOPER_ID) {
			c.reply("Qué estas buscando? Intenta usar /help");
		}
	});

	// error handle
	bot.catch((err) => {
		console.log("\n\nError:\n\n");
		console.trace(err);
	});

	return bot;
}

export default getBot;
