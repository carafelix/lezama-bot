import { Menu } from "@grammyjs/menu";
import { Lezama } from "./bot";
import { handleSuscribeStatus } from "./handlers";

const landingText =
    `<b>Lezama - Custom Daily Messages</b>

Description`

const landing = new Menu<Lezama>('landing-menu')
    .text(
        (c) => c.session.suscribed ? 'Pause' : 'Subscribe!',
        handleSuscribeStatus
    )

const settingsText = `settings\n\n`;
const settings = new Menu<Lezama>('settings-menu')
    .back('Back')
    .text('mami')


const selectSubscribeHourText = `Please select the hour for recieve your daily message`
const selectSubscribeHour = new Menu<Lezama>('select-suscribe-hour-menu')
    .back('Back')


settings.register(selectSubscribeHour)

export const settingsMenu = {
    menu: settings,
    text: settingsText
}

export const landingMenu = {
    menu: landing,
    text: landingText,
}


export const menus = [landingMenu, settingsMenu]

