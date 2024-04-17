import { Env } from 'hono'; // edited type in the declaration
import {
    Bot, InlineKeyboard,
    type CommandContext, Context,
    CallbackQueryContext,
    NextFunction,
} from 'grammy';
import { ParseMode } from 'grammy/types';

const mainMenuText =
    `veet\n\n`

const mainMenuMarkup = new InlineKeyboard()
    .text('Suscribe', 'Suscribe')
    .text('Settings', 'Settings');



function getBot(env: Env) {
    const bot = new Bot(env.BOT_TOKEN)

    bot.command('start', async c => landingMessage(c))
    bot.command('pause', async c => pauseDaily(c))
    bot.command('help', async c => c.reply('all commands listed'))

    bot.callbackQuery('Suscribe', async (c, next) => suscribeMenu(c, 'action/findOne', env.MONGO_KEY, env.MONGO_ENDPOINT, next))
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

async function landingMessage(c: CommandContext<Context>) {

    const landingMsg = 
`<b>Lezama - Custom Daily Messages</b>

Description`


    await c.reply(landingMsg, { parse_mode: "HTML"} );
    await c.reply(mainMenuText, getMessageOptsObj(mainMenuMarkup));
}


async function suscribeMenu(c : CallbackQueryContext<Context>, action : string, MONGO_KEY : string, MONGO_ENDPOINT : string, next : NextFunction) {
    

    var data = JSON.stringify({
        "collection": "poems",
        "database": "lezama",
        "dataSource": "Lezama",
        "projection": {
            "title": 1
        }
    });

    const v = await fetch(MONGO_ENDPOINT + action, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': MONGO_KEY,
            },
        body: data
        } as RequestInit)
    
    const da = await v.json()

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


export default getBot