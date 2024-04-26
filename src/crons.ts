import getBot from './telegram/bot';
import { composedFetch } from './lib/database/mongo';
import { formatPoems } from './utils/format-poems';
import { shuffleArray } from './utils/shuffle-arr';
import { rand } from './utils/utils';
import { Env, SessionData, MongoResponse } from './main';
import { D1Adapter, KvAdapter } from '@grammyjs/storage-cloudflare';

export async function dispatchTelegram(e: ScheduledController, env: Env, c: ExecutionContext) {
  switch (e.cron) {
    case "0 * * * *":
      const bot = await getBot(env)
      const currentHour = new Date(e.scheduledTime).getUTCHours()

      const subscribersAtThisHour = await new KvAdapter(env.KV_LEZAMA).read(`cron-${currentHour}`) as object
      const db_Sessions = await D1Adapter.create<SessionData>(env.D1_LEZAMA, 'sessions')

      for (const user in subscribersAtThisHour) {
        try {
          const userSession = await db_Sessions.read(user)
          if (!userSession ||
            userSession.cronHour !== currentHour
          ) {
            continue
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
          db_Sessions.write(user, userSession)
        }

        catch (err) {
          console.trace(err);
        }
      }
  }
}