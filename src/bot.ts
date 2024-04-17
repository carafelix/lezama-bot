import {
    Bot, webhookCallback, InlineKeyboard,
    type CommandContext, Context,
    CallbackQueryContext,
    NextFunction,
} from 'grammy';
import { ParseMode } from 'grammy/types';

addEventListener("fetch",webhookCallback(getBot(), "cloudflare"));


function getBot() {
    // @ts-ignore
    const bot = new Bot(BOT_TOKEN, {botInfo: JSON.parse(BOT_INFO)})

    bot.command('start', async c => landingMessage(c))
    bot.command('pause', async c => pauseDaily(c))
    bot.command('help', async c => c.reply('all commands listed'))

    bot.callbackQuery('Suscribe', async (c, next) => suscribeMenu(c,next))
    bot.callbackQuery('SuscribeOk', async c => subscribeAtHour())
    bot.callbackQuery('Settings', async c => settingsMenu(c))

    bot.callbackQuery('Back', async c => {
        await c.editMessageText(mainMenuText, getMessageOptsObj(mainMenuMarkup));
    })

    bot.command('help')

    bot.on('message', c => c.react('🏆'))
    bot.catch((err) => console.trace(err))

    return bot
}

const mainMenuText =
    `veet\n\n`

const mainMenuMarkup = new InlineKeyboard()
    .text('Suscribe', 'Suscribe')
    .text('Settings', 'Settings');

async function landingMessage(c: CommandContext<Context>) {

    const landingMsg = 
`<b>Lezama - Custom Daily Messages</b>

Description`


    await c.reply(landingMsg, { parse_mode: "HTML"} );
    await c.reply(mainMenuText, getMessageOptsObj(mainMenuMarkup));
}


async function suscribeMenu(c : CallbackQueryContext<Context>, next : NextFunction) {
    

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

    await c.editMessageText(suscribeMenuText,getMessageOptsObj(suscribeMenuMarkup))
}

async function subscribeAtHour( opts? : suscribeOpts){
    if(opts?.random || !opts?.hour){

    } else {
        console.log('fetching?')
        await fetch('/api/papi')
        .then((v)=>console.log('value is:',v))
        .catch(err=>console.log('error is:', err))
    }
}



function convertMsgHourToServerHour(){
    
}

async function settingsMenu(c: CallbackQueryContext<Context>) {

}

async function pauseDaily(c: CommandContext<Context>) {

}


function getMessageOptsObj(markup: InlineKeyboard) {
    return {
        reply_markup: markup,
        parse_mode: "HTML" as ParseMode
    }
}


