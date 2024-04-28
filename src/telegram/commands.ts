import { Lezama } from "./bot";
import { Commands } from "@grammyjs/commands";
import {
    settings,
    helpText,
    info,
    landing,
    queueInfoText
} from './menus';
import { composedFetch } from '../lib/database/mongo';
import { formatPoems, shuffleArray, rand } from '../utils/utils';
import { MongoResponse } from '../main';
import { InlineKeyboard } from "grammy";
import { Menu } from "@grammyjs/menu";



export const userCommands = new Commands<Lezama>();

userCommands.command('start', 'Inicia el bot. Si algo no funciona bien, vuelve a tirar este comando.', async (c) => {
    const session = await c.session
    if (!session.chatID) session.chatID = c.chat.id;
    await replyWithMenu(c, landing.text, landing.menu)
})

userCommands.command('help', 'Lista los comandos disponibles', async c => {
    await c.reply(helpText)
})
userCommands.command('settings', 'Accede al menu de configuraciones, toggle poemas largos, libros, autores, ordenar tu cola, etc.', async (c) => {
    const session = await c.session
    if (session.subscribed) {
        await replyWithMenu(c, settings.text, settings.menu)
    } else {
        await replyWithMenu(c, 'Te adelantas a tus propios pasos! Suscríbete primero :P', landing.menu)
    }
})

userCommands.command('resetqueue', 'Reinicia tu cola de poemas personal y la revuelve.', async c => {
    const session = await c.session
    session.queue = shuffleArray(session.allPoems.slice())
    await c.reply('Cola reseteada')
})

userCommands.command('queueinfo', 'Muestra información de tu cola de poemas.', async c => {
    const session = await c.session
    await c.reply(await queueInfoText(c))
})

userCommands.command('randompoem', 'Recibe un poema al azar de la colección.', async (c) => {
    const session = await c.session
    const poem = await composedFetch(c.env, 'short-poems', 'findOne', {
        filter: {
            "_id": session.allPoems[rand(session.allPoems.length)]
        }
    }) as MongoResponse

    if (poem) {
        await c.reply(formatPoems(poem.document))
    }
})

userCommands.command('info', 'Información relativa al bot mismo.', async (c) => {
    await replyWithMenu(c, info.text, info.menu)
})







async function replyWithMenu(c: Lezama, text: string, menu: Menu<Lezama> | InlineKeyboard) {
    await c.reply(text, { parse_mode: "HTML", reply_markup: menu })
}