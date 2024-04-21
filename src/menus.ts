import { Menu, MenuFlavor } from "@grammyjs/menu";
import { Lezama } from "./bot";
import shortiesIDs from './data/shorties.json'
import { shuffleArray } from "./utils/shuffle-arr";

const landingText =
    `<b>Lezama - Custom Daily Messages</b>

Description`

const landing = new Menu<Lezama>('landing-menu')
    .text(
        (c) => c.session.suscribed ? 'Pause' : 'Subscribe!',
        (c : Lezama & MenuFlavor) => {
            c.session.suscribed = !c.session.suscribed
            if (!c.session.queue.length) {
                // must be a call too the database instead
                c.session.queue = shuffleArray(shortiesIDs)
            }
            c.menu.update()
            c.answerCallbackQuery({
                text: c.session.suscribed ? 'Welcome to the Paradiso' : 'Running away?',
                show_alert: true,
            })
        }
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

export const helpText =
`start - Initiate a session with the bot. This command sets up your chat and provides a menu for navigation.
help - List of all available commands.
settings - Access the settings menu to customize your bot experience.
resetqueue - Reshuffle the order of all available poems for a fresh selection.
randompoem - Receive a random poem from the collection.`

export const menus = [landingMenu, settingsMenu]

