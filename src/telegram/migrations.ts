import { SessionData_v0, SessionData_v1 } from "../main";

export function reorganizeSections(old: SessionData_v0): SessionData_v1 {

    return {
        chatID: old.chatID,
        poems: {
            all: old.allPoems,
            queue: old.queue,
            visited: old.visited,
            includeMiddies: old.includeMiddies,
        },
        cron: {
            hour: old.cronHour,
            minute: 0,
            timezoneOffset: old.timezone,
        },
        subscribed: old.subscribed
    }
}
