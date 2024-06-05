import { KvAdapter } from "@grammyjs/storage-cloudflare";
import { Lezama } from "../../telegram/bot";
import { CronHours } from "../../main";

export async function updateUserSubscribeHour(
	c: Lezama,
	userChatID: string,
	oldCronHour: number,
	newCronHour: number,
) {
	const oldHourSubscribers = await c.kv.read(`cron-${oldCronHour}`);
	delete oldHourSubscribers[userChatID];
	await c.kv.write(`cron-${oldCronHour}`, oldHourSubscribers);

	const newHourSubscribers = await c.kv.read(`cron-${newCronHour}`);
	newHourSubscribers[userChatID] = true;
	await c.kv.write(`cron-${newCronHour}`, newHourSubscribers);
}

class myKv extends KvAdapter<Record<number, any>> {
	async read(key: CronHours): Promise<any | undefined> {
		return super.read(key);
	}
	async write(key: CronHours, value: any): Promise<any | undefined> {
		return super.write(key, value);
	}
}
