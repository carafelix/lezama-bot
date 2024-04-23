import getBot from './telegram/bot';
import { freeStorage } from '@grammyjs/storage-free';
import { composedFetch, readAdminData, writeAdminData } from './lib/database/handleDatabases';
import { formatPoems } from './utils/format-poems';
import { shuffleArray } from './utils/shuffle-arr';

export async function dispatchTelegram(e: ScheduledController, env: Env, c: ExecutionContext){
    switch (e.cron) {
        case "0 * * * *":
          const bot = getBot(env)
            const adminData = await readAdminData(bot,env)
            for (const user in adminData.users) {
              try {
                if (adminData.users[user] === false ||
                    adminData.users[user] !== new Date(e.scheduledTime).getUTCHours()) {
                  continue
                }
                const userSession = await freeStorage<SessionData>(bot.token,{jwt: env.FREE_STORAGE_TOKEN}).read(user)

                let poemID = userSession.queue.shift()
                if (!poemID) {
                  userSession.queue = shuffleArray(userSession.allPoems.slice())
                  poemID = userSession.queue.shift()
                }
                const poem = await composedFetch(env, 'short-poems', 'findOne', {
                  filter: {
                    "_id": poemID
                  }
                }) as MongoResponse
                await bot.api.sendMessage(user, formatPoems(poem.document))
                await freeStorage<SessionData>(bot.token,{jwt: env.FREE_STORAGE_TOKEN}).write(user, userSession)
              }
              catch (err) {
                console.log('inside err:', err);
              }
            }
          }
}