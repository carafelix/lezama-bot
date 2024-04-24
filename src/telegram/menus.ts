import { Menu } from "@grammyjs/menu";
import { Lezama } from "./bot";
import { readAdminData, writeAdminData } from "../lib/database/handleDatabases";
import { rand } from "../utils/utils";

const landingText =
    `<b>Lezama - Poesía a domicilio</b>

Este bot te permite:
- Recibir un poema al día (distinto para cada persona).
- Configurar la hora a la cual te gustaría recibir el famoso poema.
- Seleccionar la fuente de autores o libros desde los cuales se elige el poema.

Puedes listar los comandos disponibles y todo lo necesario para el uso de este bot con /help.
Si deseas contribuir o conocer la arquitectura del bot, todo aquello lo encontrarás en /info.

Pulsa el botón de abajo y comenzaras a recibir un poema al día`

const landingMenu = new Menu<Lezama>('landing')
    .text((c) => c.session.subscribed ? 'Pausar' : 'Suscríbete!',
        async (c, next) => {
            c.session.subscribed = !c.session.subscribed
            try {
                const adminData = await readAdminData(c)
                if (c.session.subscribed) {
                    adminData.users[`${c.session.chatID}`] = (c.session.cronHour - c.session.timezone) % 24;
                    await writeAdminData(c, adminData)
                } else {
                    adminData.users[`${c.session.chatID}`] = false;
                    await writeAdminData(c, adminData)
                }
            } catch (err) {
                await c.reply('An error ocurred while writing your preference')
            }
            await next()
        },
        async (c) => {
            c.menu.update()
            await c.reply(c.session.subscribed ? 'Welcome to the Paradiso' : 'Running away, uh?')
        }
    )


export const landing = {
    menu: landingMenu,
    text: landingText
}


export const helpText =
    `/start - Inicia el bot. Si algo no funciona bien, vuelve a tirar este comando y pincha 'Suscríbete'.
/settings - Accede al menu de configuraciones.
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
    .submenu('Seleccionar hora', 'select-suscribe-hour-menu', (c) => c.editMessageText(selectSubscribeHourText(c)))
    .submenu('Configurar cola', 'config-queue')

const selectSubscribeHourText = (c: Lezama) => {
    if (c.session.timezone == undefined) c.session.timezone = 0;
    return `Selecciona la hora, en UTC${c.session.timezone > 0 ? '+' + c.session.timezone : '' + c.session.timezone}, a la que quieres recibir el diario placer`
}
const selectSubscribeHour = new Menu<Lezama>('select-suscribe-hour-menu')
    .dynamic((ctx, range) => {
        for (let i = 1; i <= 24; i++) {
            range
                .text(`${i < 10 ? '0' : ''}${i}:00`,
                    async (c) => {
                        c.session.randomHour = false
                        const newHour = (i - c.session.timezone) % 24
                        c.session.cronHour = newHour
                        
                        const adminData = await readAdminData(c)
                        adminData.users[c.session.chatID] = newHour
                        await writeAdminData(c, adminData)
                        await c.reply(`Poemas programados para las ${i < 10 ? 0 : ''}${i}:00 — UTC${c.session.timezone > 0 ? '+' + c.session.timezone : '' + c.session.timezone}`)
                    })

            if (i % 4 == 0) {
                range.row();
            }
        }
    })
    .row()
    .text('Random', async (c) => {
        c.session.randomHour = true
        const randomHour = rand(24) + 1
        c.session.cronHour = randomHour
        const adminData = await readAdminData(c)
        adminData.users[c.session.chatID] = randomHour
        await writeAdminData(c, adminData)
        await c.reply('Poemas programados a hora random para cada dia')
    })
    // this should be 'Cambiar Huso horario' with a reply msg with your current time
    .text((c) => `Cambiar huso horario`,
        (c) => c.reply('Contesta este mensaje con tu huso horario en formato UTC+h. \nEjemplos: UTC+4, UTC-5, UTC+9, UTC+10.', { reply_markup: { force_reply: true } }))
    .row()
    .back('Volver', (c) => c.editMessageText(settingsText, { parse_mode: 'HTML' }))


settingsMenu.register(selectSubscribeHour)

export const settings = {
    menu: settingsMenu,
    text: settingsText
}

const infoText =
    `<b>Información</b>

Este bot esta construido sobre los Webhooks de Telegram en conjunto con Cloudflare Workers, un proveedor de funciones anónimas encima del Edge runtime 

El telegram bot framework es Grammy, el cual cuenta con muy buena documentación y un gran abanico de herramientas, incluido hosting gratis para la data de sesión. 

Para el hosting de los poemas usa MongoDB Atlas.

Puedes encontrar el código fuente en Github, y si deseas contribuir o comunicarme alguna idea, me puedes contactar al telegram en 'Contacto' o abrir un Issue en Github. 
`
const infoMenu = new Menu<Lezama>('info-menu')
    .url('Contacto', 'https://t.me/BotGodMaster')
    .url('Github', 'https://github.com/carafelix/lezama-api').row()
    .submenu("To-do's", 'todo-menu',
        (c) => c.editMessageText(todoText, { parse_mode: 'HTML' }))


const todoText =
    `<b> To-do's</b>

Tengo aún que migrar la data de sesión a Mongo, pero al parecer tiene más latencia que el FreeStorage.

Quizá en un futuro lo integre dentro de Hono, un Web Framework ligero, para montarlo también a Discord e Instagram.

Estoy pensando en quizá habilitar la posibilidad para que cada usuario pueda agregar poemas a su lista, me cuentan.
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

