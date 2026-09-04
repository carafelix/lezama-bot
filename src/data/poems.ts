import poemsJSON from "../data/poems.json";
import { Poem } from "../main";

const poems: Record<number, { poem: Poem; titleChain: string[] }> = {};

for (const p of poemsJSON) {
  poems[p.id] = { poem: p as Poem, titleChain: p.titleChain };
}

export function getPoem(id: number): Poem | undefined {
  return poems[id]?.poem;
}

export const shortiesIDs = poemsJSON
  .filter((p) => p.length < 1000)
  .map((p) => p.id);

export const middliesIDs = poemsJSON
  .filter((p) => p.length >= 1000 && p.length <= 3500)
  .map((p) => p.id);

export const allIDs = poemsJSON.map((p) => p.id);

export function getRandomPoem(): Poem {
  const ids = shortiesIDs.concat(middliesIDs)
  const randomIndex = Math.floor(Math.random() * ids.length);
  return getPoem(ids[randomIndex])!;
}

export default poemsJSON;
