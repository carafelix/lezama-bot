import { Bot, CommandContext, Context, InlineKeyboard, SessionFlavor, session } from 'grammy';
import * as Realm from 'realm-web';
import {
  settings,
  menus,
  helpText,
  landingText,
} from './menus';
import shortiesIDs from '../data/shorties.json'
import { writeAdminData, composedFetch, readAdminData } from '../lib/database/handleDatabases';
import { freeStorage } from "@grammyjs/storage-free";
import { formatPoems, shuffleArray, rand } from '../utils';
import { Menu } from '@grammyjs/menu';
import { Chat } from 'grammy/types';

export type Lezama = Context & SessionFlavor<SessionData>;

function getBot(env: Env) {

  const bot = new Bot<Lezama>(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) })

  // composer

  bot.use(session({
    initial: () => ({
      chatID: 0,
      subscribed: false,
      allPoems: shortiesIDs,
      queue: shuffleArray(shortiesIDs),
      cron: "30 13 * * *"
    }),
    storage: freeStorage<SessionData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN })
  }));


  // Register menus
  menus.forEach(menu => bot.use(menu.menu))

  // Commands 

  bot.command('start', async (c) => {
    if (!c.session.chatID) c.session.chatID = c.chat.id;
    if (!c.session?.allPoems?.length) c.session.allPoems = shortiesIDs;
    const landing = new InlineKeyboard()
    .text(c.session.subscribed ? 'Pause' : 'Subscribe!', 'handleSubscribe')
    await replyWithMenu(c,landingText,landing)
  })

  bot.callbackQuery('handleSubscribe', async (c)=>{
    c.session.subscribed = !c.session.subscribed
    if(c.chat){
      const chatId = (c.chat as Chat).id
      try {
        const adminData = await readAdminData(bot, env)
        if (c.session.subscribed) {
          if(!c.session.cron){
            c.session.cron = "30 13 * * *"
          }
          adminData.users[`${chatId}`] = c.session.cron;
          await writeAdminData(bot,env,adminData)
        } else {
          adminData.users[`${chatId}`] = false;
          await writeAdminData(bot,env,adminData)
        }
        
        const landing = new InlineKeyboard()
        .text(c.session.subscribed ? 'Pause' : 'Subscribe!', 'handleSubscribe')
        c.editMessageReplyMarkup({reply_markup:landing})
        
      } catch (err) {
        console.log(err)
      }
    }
    
  })
  
  bot.command('help', async c => {
    await c.reply(helpText)
  })
  bot.command('settings', async (c) => await replyWithMenu(c, settings.text, settings.menu))

  bot.command('resetqueue', async c => {
    c.session.queue = shuffleArray(c.session.allPoems.slice())
    await c.reply('Queue reset')
  })
  bot.command('randompoem', async (c) => {
    const poem = await composedFetch(env, 'short-poems', 'findOne', {
      filter: {
        "_id": c.session.allPoems[rand(c.session.allPoems.length)]
      }
    }) as MongoResponse

    if (poem) {
      await c.reply(formatPoems(poem.document))
    }
  })



  // nothing else matched
  bot.on('message', c => c.react('🏆'))

  // error handle
  bot.catch((err) => { console.trace(err) })

  return bot
}

export default getBot


async function replyWithMenu(c: CommandContext<Lezama>, text : string, menu: InlineKeyboard | Menu<Lezama>) {
  await c.reply(text, { parse_mode: "HTML", reply_markup: menu })
}