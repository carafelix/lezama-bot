import poemsJSON from "../data/poems.json";

const poems: Record<number, { poem: import("../main").Poem; titleChain: string[] }> = {};

for (const p of poemsJSON) {
  poems[p.id] = { poem: p as import("../main").Poem, titleChain: p.titleChain };
}

export function getPoem(id: number): import("../main").Poem | undefined {
  return poems[id]?.poem;
}

export function getRandomPoem(): import("../main").Poem {
  const ids = Object.keys(poems).map(Number);
  const randomIndex = Math.floor(Math.random() * ids.length);
  return getPoem(ids[randomIndex])!;
}

export const shortiesIDs = poemsJSON
  .filter((p) => p.length < 1000)
  .map((p) => p.id);

export const middliesIDs = poemsJSON
  .filter((p) => p.length >= 1000 && p.length <= 3000)
  .map((p) => p.id);

export const allIDs = poemsJSON.map((p) => p.id);

export default poemsJSON;