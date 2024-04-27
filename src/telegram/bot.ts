import { Bot, CommandContext, Context, InlineKeyboard, SessionFlavor, SessionOptions, lazySession, session } from 'grammy';
import {
  settings,
  menus,
  helpText,
  info,
  landing
} from './menus';
import { shortiesIDs } from '../data/poemsIDs'
import { composedFetch } from '../lib/database/mongo';
import { formatPoems, shuffleArray, rand } from '../utils/utils';
import { Menu, MenuFlavor } from '@grammyjs/menu';
import { D1Adapter, KvAdapter } from '@grammyjs/storage-cloudflare';
import { SessionData, Mixin, Env, MongoResponse } from '../main';
import { updateUserSubscribeHour } from '../lib/database/kv';

export type Lezama = Context & SessionFlavor<SessionData> & MenuFlavor & Mixin;

async function getBot(env: Env) {

  const bot = new Bot<Lezama>(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) })
  const db_Sessions = await D1Adapter.create<SessionData>(env.D1_LEZAMA, 'sessions')

  // composer

  bot.use(async (c, next) => {
    c.env = env;
    c.kv = new KvAdapter<string>(env.KV_LEZAMA)
    await next();
  })

  bot.use(lazySession({
    initial: () => ({
      chatID: 0,
      allPoems: shortiesIDs,
      queue: shuffleArray(shortiesIDs),
      visited: [],
      cronHour: 13,
      timezone: -4,
      includeMiddies: false,
      subscribed: false
    }),
    storage: db_Sessions
  }));

  menus.forEach(menu => bot.use(menu.menu))

  // Commands 

  bot.command('start', async (c) => {
    const session = await c.session
    if (!session.chatID) session.chatID = c.chat.id;
    await replyWithMenu(c, landing.text, landing.menu)
  })

  bot.command('help', async c => {
    await c.reply(helpText)
  })
  bot.command('settings', async (c) => {
    const session = await c.session
    if(session.subscribed){
      await replyWithMenu(c, settings.text, settings.menu)
    } else {
      await replyWithMenu(c, 'Te adelantas a tus propios pasos! Suscríbete primero :P', landing.menu)
    }
  })

  bot.command('resetqueue', async c => {
    const session = await c.session
    session.queue = shuffleArray(session.allPoems.slice())
    await c.reply('Queue reset')
  })
  bot.command('randompoem', async (c) => {
    const session = await c.session
    const poem = await composedFetch(env, 'short-poems', 'findOne', {
      filter: {
        "_id": session.allPoems[rand(session.allPoems.length)]
      }
    }) as MongoResponse

    if (poem) {
      await c.reply(formatPoems(poem.document))
    }
  })

  bot.command('info', async (c) => {
    await replyWithMenu(c, info.text, info.menu)
  })

  bot.hears(/^(GMT|UTC)([+-][0-9]|[+-]1[0-2]|[+]1[2-4])$/,
    async (c) => {
      const session = await c.session
      const offset = c.message?.text?.slice(3)
      if (offset) {
        const oldRawHour = session.cronHour + session.timezone

        session.timezone = (+offset)
        session.cronHour = oldRawHour - (+offset)

        await updateUserSubscribeHour(c, `${session.chatID}`, oldRawHour, session.cronHour)

        await c.reply('Cambio de huso horario exitoso a UTC' + offset)
      }
    })

  bot.command("usercount", async (c: Lezama, next) => {
    if (`${c.from?.id}` === c.env.DEVELOPER_ID) {
      let count = 0
      for await (const hour of c.kv.readAllKeys()) {
        const hourObj = await c.kv.read(hour)
        for(const user in hourObj){
          count++
        }
      }
      await c.reply('' + count)
    } else {
      await next()
    }
  });

  // nothing else matched
  bot.on('message', c => c.reply('Qué estas buscando? Intenta usar /help'))

  // error handle
  bot.catch((err) => { console.log('\n\nError:\n\n'); console.trace(err) })

  return bot
}

export default getBot


async function replyWithMenu(c: CommandContext<Lezama>, text: string, menu: Menu<Lezama> | InlineKeyboard) {
  await c.reply(text, { parse_mode: "HTML", reply_markup: menu })
}