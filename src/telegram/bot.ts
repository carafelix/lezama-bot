import { Bot, CommandContext, Context, InlineKeyboard, SessionFlavor, session } from 'grammy';
import {
  settings,
  menus,
  helpText,
  info,
  landing
} from './menus';
import shortiesIDs from '../data/shorties.json'
import { writeAdminData, composedFetch, readAdminData } from '../lib/database/handleDatabases';
import { freeStorage } from "@grammyjs/storage-free";
import { formatPoems, shuffleArray, rand } from '../utils/utils';
import { Menu, MenuFlavor } from '@grammyjs/menu';

export type Lezama = Context & SessionFlavor<SessionData> & MenuFlavor & envWrapper;

function getBot(env: Env) {

  const bot = new Bot<Lezama>(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) })

  // composer

  bot.use(async (c, next) => {
    c.env = env;
    await next();
  })

  bot.use(session({
    initial: () => ({
      chatID: 0,
      subscribed: false,
      allPoems: shortiesIDs,
      queue: shuffleArray(shortiesIDs),
      cronHour: 13,
      randomHour: false,
      timezone: 0
    }),
    storage: freeStorage<SessionData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN })
  }));


  menus.forEach(menu => bot.use(menu.menu))

  // Commands 

  bot.command('start', async (c) => {
    if (!c.session.chatID) c.session.chatID = c.chat.id;
    await replyWithMenu(c, landing.text, landing.menu)
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

  bot.command('info', async (c) => {
    await replyWithMenu(c, info.text, info.menu)
  })

  bot.hears( /^(GMT|UTC)([+-][0-9]|[+-]1[0-2]|[+]1[2-4])$/ , 
      (c) => {
        const offset = c.message?.text?.slice(3)
        if(offset){
          c.session.timezone = +offset
          c.reply('Cambio de huso horario exitoso a UTC' + offset)
        }
      })

  // nothing else matched
  bot.on('message', c => c.reply('Qué estas buscando? Intenta usar /help'))

  // error handle
  bot.catch((err) => { console.trace(err) })

  return bot
}

export default getBot


async function replyWithMenu(c: CommandContext<Lezama>, text: string, menu:  Menu<Lezama> | InlineKeyboard) {
  await c.reply(text, { parse_mode: "HTML", reply_markup: menu })
}