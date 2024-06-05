import { SessionData_v0, SessionData_v1 } from "../main";
import { allIDs, shortiesIDs } from "../data/poemsIDs";
import { shuffleArray } from "../utils/utils";

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
		subscribed: old.subscribed,
	};
}
export function addNewPoems(old: SessionData_v1): SessionData_v1 {
	if (old.poems.includeMiddies) {
		old.poems.all = allIDs;
		old.poems.queue = shuffleArray(
			allIDs.filter((id) => !old.poems.visited.includes(id)),
		);
	} else {
		old.poems.all = shortiesIDs;
		old.poems.queue = shuffleArray(
			shortiesIDs.filter((id) => !old.poems.visited.includes(id)),
		);
	}
	return old;
}
