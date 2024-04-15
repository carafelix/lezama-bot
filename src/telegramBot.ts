import { Bot } from "grammy"
import { BOT_TOKEN } from './_env.json'

const bot = new Bot(BOT_TOKEN)

bot.command('start',c => c)

bot.catch((err)=> console.trace(err))

export default bot