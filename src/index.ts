import { webhookCallback } from 'grammy';
import getBot from './telegram/bot';
import { dispatchTelegram } from './crons';

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
    await dispatchTelegram(e,env,c)
  }

} satisfies ExportedHandler<Env>