import { Bot, Context, SessionFlavor, session } from 'grammy';
import * as Realm from 'realm-web';
import {
  mainMenu,
  settingsMenu,
  subscribeMenu,
  landingMessage,
} from './menus';
import { composedFetch } from './lib/database/mongo';
import { freeStorage } from "@grammyjs/storage-free";
import shortiesIDs from './data/shorties.json'
import { formatPoems, shuffleArray } from './utils/utils';


import { MongoDBAdapter, ISession } from "@grammyjs/storage-mongodb";


export type Lezama = Context & SessionFlavor<SessionData>;

async function getBot(env: Env) {

  const bot = new Bot<Lezama>(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) })

  // composer

  bot.use(session({
    initial: () => ({
      chatID: 0,
      queue: shuffleArray(shortiesIDs),
      visited: [],
    }),
    storage: freeStorage<SessionData>(bot.token)
  }));

  // Register menus
  bot.use(mainMenu.menu)

  bot.command('start', landingMessage)
  bot.command('start', async (c) => await c.reply(mainMenu.text, { reply_markup: mainMenu.menu }))
  bot.command('help', async c => await c.reply(`${c.chat.id}`))

  bot.command('menu', async (c) => await c.reply(mainMenu.text, { reply_markup: mainMenu.menu }))
  bot.command('settings', async (c) => await c.reply(settingsMenu.text, { reply_markup: settingsMenu.menu }))
  bot.command('subscribe', async (c) => await c.reply(subscribeMenu.text, { reply_markup: subscribeMenu.menu }))

  bot.command('test0', async (c) => {
    const p = await composedFetch('short-poems', 'findOne', {
      filter: { "_id": c.session.queue[Math.floor(Math.random() * c.session.queue.length)] }
    }) as MongoResponse

    await c.reply(formatPoems(p.document))
  })


  bot.on('message', c => c.react('🏆'))
  bot.catch((err) => { console.trace(err) })

  return bot
}

export default getBot
