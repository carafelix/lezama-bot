import { webhookCallback } from 'grammy';
import getBot from './bot';

(async () => {
  const bot = await getBot();
  addEventListener("fetch", webhookCallback(bot, "cloudflare"))
  addEventListener("scheduled", async (e: ScheduledEvent) => {
    switch (e.cron) {
      case "1 * * * *":
        await bot.api.sendMessage(-4196751149, 'cronjob1')
        break;
    }
  })
})()

// export default {

//   async fetch(req: Request, env: Env, c: ExecutionContext) {
//     let response = new Response('Bot initialization failed')

//     try {
//       const bot = await getBot(env)
//       response = await webhookCallback(bot, 'cloudflare-mod')(req)
//     }
//     catch (err) {
//       console.log(err);
//     }

//     return response
//   },
//   async scheduled(e: ScheduledController, env: Env, c: ExecutionContext) {
//     switch (e.cron) {
//       case "1 * * * *":
//         const bot = await getBot(env)
//         await bot.api.sendMessage(-4196751149, 'cronjob1')
//       break;
//     }
//     return
//   }env: Env

// } satisfies ExportedHandler<Env>