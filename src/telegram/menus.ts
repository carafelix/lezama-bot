import { Menu } from "@grammyjs/menu";
import { Lezama } from "./bot";
import { rand, shuffleArray } from "../utils/utils";
import { allIDs, shortiesIDs, middliesIDs } from "../data/poemsIDs";
import { D1Adapter } from "@grammyjs/storage-cloudflare";
import { SessionData } from "../main";


const landingText =
    `<b>Lezama - Poesía a domicilio</b>

Este bot te permite:
- Recibir un poema al día (distinto para cada persona).
- Configurar la hora a la cual te gustaría recibir el famoso poema.
- Seleccionar la fuente de autores o libros desde los cuales se elige el poema.

Puedes listar los comandos disponibles y todo lo necesario para el uso de este bot con /help.
Si deseas contribuir o conocer la arquitectura del bot, todo aquello lo encontrarás en /info.
Una vez suscrito puedes usar /settings.

Pulsa el botón de abajo y comenzaras a recibir un poema al día`

const landingMenu = new Menu<Lezama>('landing')
    .text(async (c) => {
        const session = await c.session
        return session.subscribed ? 'Pausar' : 'Suscríbete!'
    },
        async (c, next) => {
            const session = await c.session
            let allSubscribersAtThisHour = await c.kv.read(`cron-${session.cronHour}`)
            if (!allSubscribersAtThisHour || typeof allSubscribersAtThisHour !== "object") {
                allSubscribersAtThisHour = {}
            }
            if (!session.subscribed) {
                allSubscribersAtThisHour[`${session.chatID}`] = true;
                await c.kv.write(`cron-${session.cronHour}`, allSubscribersAtThisHour)
                session.subscribed = true
            }
            else {
                delete allSubscribersAtThisHour[`${session.chatID}`]
                await c.kv.write(`cron-${session.cronHour}`, allSubscribersAtThisHour)
                session.subscribed = false
            }
            c.menu.update()
        }
    )


export const landing = {
    menu: landingMenu,
    text: landingText
}


export const helpText =
    `/start - Inicia el bot. Si algo no funciona bien, vuelve a tirar este comando y pincha 'Suscríbete'.
/settings - Accede al menu de configuraciones, toggle poemas largos, libros, autores, ordenar tu cola, etc.
/help - Lista los comandos disponibles.
/info - Información relativa al bot mismo.
/resetqueue - Reinicia tu cola de poemas personal y la revuelve.
/randompoem - Recibe un poema al azar de la colección.`


const settingsText =
    `<b>Configuraciones</b>

Aquí podrás configurar:

- La hora a la que deseas recibir el poema diario, o ponerla en aleatorio.

- Configurar tu cola de poemas personal:
    - Seleccionar los libros u autores de los cuales se conformara tu cola.
    - Ordenarla por fecha de publicación, por orden alfabético o en aleatorio.
`;
const settingsMenu = new Menu<Lezama>('settings-menu')
    .submenu('Seleccionar hora', 'select-suscribe-hour-menu', async (c) => await c.editMessageText(await selectSubscribeHourText(c)))
    .submenu('Configurar cola', 'config-queue', (c) => c.editMessageText(configQueueText, { parse_mode: 'HTML' })
    )

const selectSubscribeHourText = async (c: Lezama) => {
    const session = await c.session
    if (session.timezone == undefined) session.timezone = 0;
    return `Selecciona la hora a la que quieres recibir el diario placer. Actual: ${(session.cronHour - session.timezone) < 10 ? '0' : ''}${session.cronHour - session.timezone}:00, UTC${session.timezone >= 0 ? '+' + session.timezone : '' + session.timezone}.`
}
const selectSubscribeHour = new Menu<Lezama>('select-suscribe-hour-menu')
    .dynamic((ctx, range) => {
        for (let i = 1; i <= 24; i++) {
            range
                .text(`${i < 10 ? '0' : ''}${i}:00`,
                    async (c) => {
                        const session = await c.session

                        const oldCronHour = session.cronHour
                        const newHour = (i - session.timezone + 24) % 24
                        session.cronHour = newHour

                        const allSubscribersAtOldHour = await c.kv.read(`cron-${oldCronHour}`)
                        delete allSubscribersAtOldHour[`${session.chatID}`]
                        await c.kv.write(`cron-${oldCronHour}`, allSubscribersAtOldHour)

                        let allSubscribersAtNewHour = await c.kv.read[`cron-${session.cronHour}`]
                        if(!allSubscribersAtNewHour){
                            allSubscribersAtNewHour = {}
                        }
                        allSubscribersAtNewHour[`${session.chatID}`] = true
                        await c.kv.write(`cron-${session.cronHour}`, allSubscribersAtNewHour)

                        await c.reply(`Poemas programados para las ${i < 10 ? 0 : ''}${i}:00 — UTC${session.timezone >= 0 ? '+' + session.timezone : '' + session.timezone}`)
                    })

            if (i % 4 == 0) {
                range.row();
            }
        }
    })
    .row()
    // this should be 'Cambiar Huso horario' with a reply msg with your current time
    .text((c) => `Cambiar huso horario`,
        (c) => c.reply('Contesta este mensaje con tu huso horario en formato UTC+h, en numero enteros. \nEjemplos: UTC+4, UTC-5, UTC+9, UTC+10.', { reply_markup: { force_reply: true } }))
    .row()
    .url('Tu huso horario', 'https://www.timeanddate.com/time/difference/timezone/utc')
    .back('Volver', (c) => c.editMessageText(settingsText, { parse_mode: 'HTML' }))


const configQueueText =
    `<b>Configura tu cola de poemas</b>

Por defecto incluye solo los poemas de menos de mil caracteres. Activando la opción de poemas largos incluye hasta el tope de 4096 caracteres.`
const configQueueMenu = new Menu<Lezama>('config-queue')
    .text(async (c) => {
        const session = await c.session
        return !session.includeMiddies ? 'Activar poemas largos' : 'Desactivar poemas largos'
    },
        async (c) => {
            const session = await c.session
            if (!session.visited) session.visited = [];

            session.includeMiddies = !session.includeMiddies
            if (session.includeMiddies) {
                session.allPoems = allIDs
                session.queue = shuffleArray(
                    allIDs.filter((id) => !session.visited.includes(id))
                )
            } else {
                session.allPoems = shortiesIDs
                session.queue = shuffleArray(
                    shortiesIDs.filter((id) => !session.visited.includes(id))
                )
            }
            c.menu.update()
        },
    )
    .back('Volver', async (c) => await c.editMessageText(settingsText, { parse_mode: 'HTML' }))

settingsMenu.register(selectSubscribeHour)
settingsMenu.register(configQueueMenu)

export const settings = {
    menu: settingsMenu,
    text: settingsText
}

const infoText =
    `<b>Información</b>

Este bot esta construido sobre los Webhooks de Telegram en conjunto con Cloudflare Workers, un proveedor de funciones anónimas encima del Edge runtime.

El telegram bot framework es Grammy, el cual cuenta con muy buena documentación y un gran abanico de herramientas, incluido hosting gratis para la data de sesión. 

Para el hosting de los poemas usa MongoDB Atlas. Para el hosting de la data de sesión usa una database SQL, D1, de Cloudflare, en conjunto con KV, un sistema de almacenamiento rápido, también de Cloudflare, para chequear los usuarios con suscripción activa.

Puedes encontrar el código fuente en Github, y si deseas contribuir o comunicarme alguna idea, me puedes contactar al telegram en 'Contacto' o abrir un Issue en Github. 
`
const infoMenu = new Menu<Lezama>('info-menu')
    .url('Contacto', 'https://t.me/BotGodMaster')
    .url('Github', 'https://github.com/carafelix/lezama-api').row()
    .submenu("To-do's", 'todo-menu',
        (c) => c.editMessageText(todoText, { parse_mode: 'HTML' }))


const todoText =
    `<b> To-do's</b>

Quizá en un futuro lo integre dentro de Hono, un Web Framework ligero, para montarlo también a Discord e Instagram.

Estoy pensando en quizá habilitar la posibilidad para que cada usuario pueda agregar poemas a su lista, me cuentan.
Ahora que la database esta en D1, los poemas custom podrían guardarse en los datos de session.
`
const todo = new Menu<Lezama>('todo-menu')
    .back('Volver',
        (c) => c.editMessageText(infoText, { parse_mode: 'HTML' })
    )


infoMenu.register(todo)

export const info = {
    menu: infoMenu,
    text: infoText
}

export const menus = [settings, info, landing]

