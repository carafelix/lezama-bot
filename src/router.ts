import { Hono } from "hono"
import { webhookCallback } from "grammy";
import bot from "./telegramBot";

const app = new Hono()

app.all('/api/telegram/webhook', webhookCallback(bot,'hono'))
app.fire() 

app.onError((err)=>{
    return new Response(err.message)
})

export default app