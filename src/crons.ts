import getBot from './telegram/bot';
import { freeStorage } from '@grammyjs/storage-free';
import { composedFetch, readAdminData, writeAdminData } from './lib/database/handleDatabases';
import { formatPoems } from './utils/format-poems';
import { shuffleArray } from './utils/shuffle-arr';
import { rand } from './utils/utils';

export async function dispatchTelegram(e: ScheduledController, env: Env, c: ExecutionContext) {
  switch (e.cron) {
    case "0 * * * *":
      const bot = getBot(env)
      const adminData = await freeStorage<AdminData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN })
            .read(env.FREE_STORAGE_SECRET_KEY)
      for (const user in adminData.users) {
        try {
          // more optimal would be to store the users in a cron collection,
          // and in each hour key store the users that are register to that hour
          if (adminData.users[user] === false ||
            adminData.users[user] !== new Date(e.scheduledTime).getUTCHours()) {
            continue
          }
          const userSession = await freeStorage<SessionData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN }).read(user)

          if (userSession.randomHour) {
            const randomHour = rand(24) + 1
            // why im duping the write to 2 places everywhere? this could get de-sync
            userSession.cronHour = randomHour
            adminData.users[userSession.chatID] = randomHour
          }

          let poemID = userSession.queue.shift()
          if (!poemID) {
            userSession.queue = shuffleArray(userSession.allPoems.slice())
            poemID = userSession.queue.shift()
            userSession.visited = []
          }
          const poem = await composedFetch(env, 'poems', 'findOne', {
            filter: {
              "_id": poemID
            }
          }) as MongoResponse
          await bot.api.sendMessage(user, formatPoems(poem.document))

          userSession.visited.push(poemID!)

          await freeStorage<SessionData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN }).write(user, userSession)
        }
        catch (err) {
          console.log('inside err:', err);
        }
      }
      await freeStorage<AdminData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN })
            .write(env.FREE_STORAGE_SECRET_KEY, adminData)
  }
}