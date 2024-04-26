import getBot from './telegram/bot';
import { composedFetch } from './lib/database/mongo';
import { formatPoems } from './utils/format-poems';
import { shuffleArray } from './utils/shuffle-arr';
import { rand } from './utils/utils';
import { Env, AdminData, SessionData, MongoResponse, Mixin } from './main';
import { D1Adapter, KvAdapter } from '@grammyjs/storage-cloudflare';

export async function dispatchTelegram(e: ScheduledController, env: Env, c: ExecutionContext) {
  switch (e.cron) {
    case "0 * * * *":
      const bot = await getBot(env)
      const users = await new KvAdapter(env.KV_LEZAMA).readAllKeys()
      const db_Sessions = await D1Adapter.create<SessionData>(env.D1_LEZAMA, 'sessions')

      for await (const user of users) {
        try {
          const userSession = await db_Sessions.read(user)

          if (!userSession ||
              userSession.cronHour !== new Date(e.scheduledTime).getUTCHours()) {
            continue
          }

          if (userSession.randomHour) {
            const randomHour = rand(24) + 1
            userSession.cronHour = randomHour
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

          db_Sessions.write(user,userSession)
        }

        catch (err) {
              console.trace(err);
        }
      }
  }
}