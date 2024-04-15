import { Hono } from "hono"
import { webhookCallback } from "grammy";
import bot from "./telegramBot";

const app = new Hono()

app.all('/api/telegram/webhook', webhookCallback(bot,'hono'))
app.all('*',(c)=> c.text('You are not suppose to be here'))
app.onError((err)=>{
    return new Response(err.message)
})

app.fire() 


export default app