import { Bot, CommandContext, Context, SessionFlavor, session } from 'grammy';
import * as Realm from 'realm-web';
import {
  landingMenu,
  settingsMenu,
  menus,
} from './menus';
import shortiesIDs from './data/shorties.json'
import { composedFetch } from './lib/database/mongo';
import { freeStorage } from "@grammyjs/storage-free";
import { formatPoems, shuffleArray, rand } from './utils/utils';


import { MongoDBAdapter, ISession } from "@grammyjs/storage-mongodb";


export type Lezama = Context & SessionFlavor<SessionData>;

async function getBot(env: Env) {

  const bot = new Bot<Lezama>(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) })

  // composer

  bot.use(session({
    initial: () => ({
      chatID: 0,
      suscribed: false,
      allPoems: shortiesIDs,
      queue: shuffleArray(shortiesIDs),
      visited: []
    }),
    storage: freeStorage<SessionData>(bot.token, {jwt: env.FREE_STORAGE_TOKEN})
  }));



  // Register menus
  menus.forEach(menu => bot.use(menu.menu))

  // Commands 

  bot.command('start', async (c) => {
    if (!c.session.chatID) c.session.chatID = c.chat.id;
    if (!c.session?.allPoems?.length) c.session.allPoems = shortiesIDs;
    await replyWithMenu(c, landingMenu)

    const users = (await freeStorage<AdminData>(bot.token).read(env.FREE_STORAGE_SECRET_KEY)).users
    if(!users[`${c.chat.id}`]){
      users[`${c.chat.id}`] = `${c.chat.id}`
      await freeStorage<AdminData>(bot.token).write(env.FREE_STORAGE_SECRET_KEY,
        {users: users}
      )
    }
  })
  bot.command('help', async c => await c.reply(`chatID: ${c.chat.id}; list all commands`))    
  bot.command('settings', async (c) => await replyWithMenu(c, settingsMenu))

  bot.command('resetqueue', async c => c.session.queue = shuffleArray(c.session.allPoems.slice()))
  bot.command('randompoem', async (c) => {
    const poem = await composedFetch(env,'short-poems', 'findOne', {
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


async function replyWithMenu(c: CommandContext<Lezama>, menu: ExportedMenu) {
  await c.reply(menu.text, { parse_mode: "HTML", reply_markup: menu.menu })
}