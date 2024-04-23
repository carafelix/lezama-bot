import { Menu, MenuFlavor } from "@grammyjs/menu";
import { Lezama } from "./bot";
import shortiesIDs from './data/shorties.json'
import { shuffleArray } from "./utils/shuffle-arr";
import { InlineKeyboard } from "grammy";

export const landingText =
`<b>Lezama - Custom Daily Messages</b>

Description`



const settingsText = `settings\n\n`;
const settingsMenu = new Menu<Lezama>('settings-menu')
    .back('Back')
    .text('mami')


const selectSubscribeHourText = `Please select the hour for recieve your daily message`
const selectSubscribeHour = new Menu<Lezama>('select-suscribe-hour-menu')
    .back('Back')


settingsMenu.register(selectSubscribeHour)

export const settings = {
    menu: settingsMenu,
    text: settingsText
}



export const helpText =
`start - Initiate a session with the bot. This command sets up your chat and provides a menu for navigation.
help - List of all available commands.
settings - Access the settings menu to customize your bot experience.
resetqueue - Reshuffle the order of all available poems for a fresh selection.
randompoem - Receive a random poem from the collection.`

export const menus = [settings]

