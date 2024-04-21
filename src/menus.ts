import { Menu } from "@grammyjs/menu";
import { CommandContext, Context, NextFunction, CallbackQueryContext, InlineKeyboard } from "grammy";

export async function landingMessage(c: CommandContext<Context>, next : NextFunction) {
    const landingMsg = 
`<b>Lezama - Custom Daily Messages</b>

Description`
    await c.reply(landingMsg, { parse_mode: "HTML"} );
    next()
}

const mainText = `veet\n\n`;
const main = new Menu('mainMenu')
            .submenu('Subscribe!', 'subscribe-menu')
            .submenu('Settings', 'settings-menu')


const subscribeText = `subscribe\n\n`;
const subscribe = new Menu('subscribe-menu')
            .back('Back')
            .text('papi')


const settingsText = `settings\n\n`;
const settings = new Menu('settings-menu')
            .back('Back')
            .text('mami')


const selectSubscribeHourText = `Please select the hour for recieve your daily message`
const selectSubscribeHour = new Menu('select-suscribe-hour-menu')
            .back('Back')

main.register(settings);
main.register(subscribe);
subscribe.register(selectSubscribeHour)

export const mainMenu = {
    menu: main,
    text: mainText
}
export const subscribeMenu = {
    menu: subscribe,
    text: subscribeText
}
export const settingsMenu = {
    menu: settings,
    text: settingsText
}

