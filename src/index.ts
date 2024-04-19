import { webhookCallback } from 'grammy';
import bot from './bot';

addEventListener("fetch", webhookCallback(bot, "cloudflare"));

addEventListener("scheduled", (e : ScheduledEvent)=>{
    switch (e.cron) {
        case "*/30 * * * *":
            // dispatch
            console.log('CRONCRON')
          break;
        }
});
