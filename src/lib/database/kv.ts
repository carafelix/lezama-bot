import { Lezama } from "../../telegram/bot";

export async function updateUserSubscribeHour(
    c: Lezama,
    userChatID: string,
    oldCronHour: number,
    newCronHour: number) {

    const oldHourSubscribers = await c.kv.read(`cron-${oldCronHour}`)
    delete oldHourSubscribers[userChatID]
    await c.kv.write(`cron-${oldCronHour}`,oldHourSubscribers)

    const newHourSubscribers = await c.kv.read(`cron-${newCronHour}`)
        newHourSubscribers[userChatID] = true
    await c.kv.write(`cron-${newCronHour}`, newHourSubscribers)
}