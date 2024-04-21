import { freeStorage } from '@grammyjs/storage-free';
import shortiesIDs from './data/shorties.json'
import { shuffleArray } from './utils/utils';

// i'll reintroduce when i figure out how can I get the type of something and export it to veet
// export function handleSuscribeStatus(c : ) {
    
//     c.session.suscribed = !c.session.suscribed

//     if (!c.session.queue.length) {
//         // must be a call too the database instead
//         c.session.queue = shuffleArray(shortiesIDs)
//     }
//     c.menu.update()
//     c.answerCallbackQuery({
//         text: c.session.suscribed ? 'Welcome to the Paradiso' : 'So you are going...',
//     })
// }