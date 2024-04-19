import { Bot } from 'grammy';
import { 
    mainMenu,
    settingsMenu,
    subscribeMenu,
    allMenus,
    landingMessage,
 } from './menus';

    // @ts-ignore
    const bot = new Bot(BOT_TOKEN, {botInfo: JSON.parse(BOT_INFO)})

    // Register menus
    allMenus.forEach((menu)=>bot.use(menu.menu))

    bot.command('start', landingMessage)
    bot.command('start', async (c) => await c.reply(mainMenu.text, { reply_markup: mainMenu.menu }) )
    bot.command('help', async c => c.reply('all commands listed'))
   
    bot.command('menu', async (c) => await c.reply(mainMenu.text, { reply_markup: mainMenu.menu }) )
    bot.command('settings', async (c) => await c.reply(settingsMenu.text, {reply_markup: settingsMenu.menu}))
    bot.command('subscribe', async (c) => await c.reply(subscribeMenu.text, {reply_markup: subscribeMenu.menu}))


    bot.on('message', c => c.react('🏆'))
    bot.catch((err) => console.trace(err))

export default bot