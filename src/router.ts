import { Env, ExecutionContext, Hono } from "hono"
import { webhookCallback } from "grammy";
import getBot from "./telegramBot";



export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const app = new Hono()
        app.all('/api/telegram/webhook', webhookCallback(getBot(env), 'hono'))
        app.all('*',(c)=> c.text('Any other call would receive this response'))
        app.onError((err)=>{
            return new Response(err.message)
        })

      return app.fetch(request, env, ctx)
    },
  }