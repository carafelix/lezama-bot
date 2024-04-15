import { Bot } from "grammy"
import { Env } from "hono"

function getBot(env : Env){
    const bot = new Bot(env.BOT_TOKEN)
    bot.command('start',c => c)
    bot.on('message', c => c.react("🏆"))
    bot.catch((err)=> console.trace(err))

    return bot
}

export default getBot