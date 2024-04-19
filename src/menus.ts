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
            .submenu('Subscribe', 'subscribe-menu')
            .submenu('Settings', 'settings-menu')


const subscribeText = `subscribe\n\n`;
const subscribe = new Menu('subscribe-menu')
            .text('papi')
            .back('Back')


const settingsText = `settings\n\n`;
const settings = new Menu('settings-menu')
            .text('mami')
            .back('Back')


const selectSuscribeHourText = `Please select the hour for recieve your daily message`
const selectSuscribeHour = new Menu('select-suscribe-hour-menu')

main.register(settings);
main.register(subscribe);

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

export const allMenus = [mainMenu, subscribeMenu, settingsMenu]




    
    // if(c.callbackQuery){
    //     await c.editMessageText(mainMenuText, getMessageOptsObj(mainMenuMarkup));
    // } else {
    //     await c.reply(mainMenuText, getMessageOptsObj(mainMenuMarkup));
    // }

async function handleReplyOrInlineEdit(c : CallbackQueryContext<Context> | CommandContext<Context> , text : string, markup : Menu){
    if(c.callbackQuery){
        await c.editMessageText(text, { reply_markup: markup })
    } else {
        await c.reply(text, { reply_markup: markup })
    }
}



export async function handleSubscribeMenu(c : CallbackQueryContext<Context> | CommandContext<Context>, next? : NextFunction) {
    
    await c.reply('new suscribe menu')

    // const data = JSON.stringify({
    //     "collection": "poems",
    //     "database": "lezama",
    //     "dataSource": "Lezama",
    //     "projection": {
    //         "title": 1
    //     }
    // });

    // const v = await fetch(MONGO_ENDPOINT + action, {
    //     method: 'post',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Access-Control-Request-Headers': '*',
    //         'api-key': MONGO_KEY,
    //         },
    //     body: data
    //     } as RequestInit)
    
    // const da = await v.json()

    const suscribeMenuText = 
`<b>Press the Select Hour</b>
`
    const suscribeMenuMarkup = (
        new InlineKeyboard()
            .text('Back','Back')
            .text('Ok', 'SuscribeOk')
        )

    // await c.editMessageText(suscribeMenuText,getMessageOptsObj(suscribeMenuMarkup))
}

export async function handleSettingsMenu(c: CallbackQueryContext<Context> | CommandContext<Context>, next : NextFunction) {
    console.log(c.callbackQuery)
}

// export async function handleSubscribeAtHour(){
//     if(opts?.random || !opts?.hour){

//     } else {
//         console.log('fetching?')
//         await fetch('/api/papi')
//         .then((v)=>console.log('value is:',v))
//         .catch(err=>console.log('error is:', err))
//     }
// }



function handleconvertMsgHourToServerHour(){
    
}

