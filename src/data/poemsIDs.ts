import shortiesIDs from "./poemsIDs/shorties.json";
import middliesIDs from "./poemsIDs/middlies.json";
import longiesIDs from "./poemsIDs/longies.json";
import poemsJSON from "../data/poems.json";

const allIDs = poemsJSON.map((p) => p.id);

export { allIDs, longiesIDs, middliesIDs, shortiesIDs };