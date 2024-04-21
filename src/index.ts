import { webhookCallback } from 'grammy';
import getBot from './bot';
import { freeStorage } from '@grammyjs/storage-free';
import { composedFetch } from './lib/database/mongo';
import { formatPoems } from './utils/format-poems';
import { shuffleArray } from './utils/shuffle-arr';

export default {

  async fetch(req: Request, env: Env, c: ExecutionContext) {
    let response = new Response('Bot initialization failed or... who are you?')

    try {
      const bot = getBot(env)
      response = await webhookCallback(bot, 'cloudflare-mod')(req)
    }
    catch (err) {
      console.log(err);
    }

    return response
  },
  async scheduled(e: ScheduledController, env: Env, c: ExecutionContext) {
    switch (e.cron) {
      case "30 13 * * *":
        const bot = getBot(env)
          const adminData = await freeStorage<AdminData>(bot.token,{jwt: env.FREE_STORAGE_TOKEN}).read(env.FREE_STORAGE_SECRET_KEY)
          for (const user in adminData.users) {
            try {

              // this should not be done.
              // non-suscribed users should be deleted / inserted from the admin.users list
              // when they press the pause / suscribe button
              // so we don't waste time getting their session
              
              const userSession = await freeStorage<SessionData>(bot.token,{jwt: env.FREE_STORAGE_TOKEN}).read(user)
              if (!userSession.suscribed) continue;
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

          break;
        }
    return
  }

} satisfies ExportedHandler<Env>