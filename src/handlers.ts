import shortiesIDs from './data/shorties.json'
import { shuffleArray } from './utils/utils';

export function handleSuscribeStatus(c: { session: { suscribed: boolean; queue: string | any[]; }; menu: { update: () => void; }; answerCallbackQuery: (arg0: string) => void; }) {

    c.session.suscribed = !c.session.suscribed

    if (!c.session.queue.length) {
        // must be a call too the database instead
        c.session.queue = shuffleArray(shortiesIDs)
    }
    c.menu.update()
    c.answerCallbackQuery(c.session.suscribed ? 'Welcome to the Paradiso' : 'So you are going...')
}