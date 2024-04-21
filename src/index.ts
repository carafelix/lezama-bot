import { webhookCallback } from 'grammy';
import getBot from './bot';
import { freeStorage } from '@grammyjs/storage-free';
import { composedFetch } from './lib/database/mongo';
import { formatPoems } from './utils/format-poems';

export default {

  async fetch(req: Request, env: Env, c: ExecutionContext) {
    let response = new Response('Bot initialization failed')

    try {
      const bot = await getBot(env)
      response = await webhookCallback(bot, 'cloudflare-mod')(req)
    }
    catch (err) {
      console.log(err);
    }

    return response
  },
  async scheduled(e: ScheduledController, env: Env, c: ExecutionContext) {
    switch (e.cron) {
      case "30 9 * * *":
        const bot = await getBot(env)
        const users = (await freeStorage<AdminData>(bot.token).read(env.FREE_STORAGE_SECRET_KEY)).users

        for (const user in users) {
          try {
            const userSession = await freeStorage<SessionData>(bot.token).read(user)
            const poemID = userSession.queue[0]
            const poem = await composedFetch(env,'short-poems', 'findOne', {
              filter: {
                "_id": poemID
              }
            }) as MongoResponse

            await bot.api.sendMessage(user,formatPoems(poem.document))
          }
          catch (err) {
            console.log(err);
          }
        }

        break;
    }
    return
  }

} satisfies ExportedHandler<Env>