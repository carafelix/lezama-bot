import shortiesIDs from "./poemsIDs/shorties.json";
import middliesIDs from "./poemsIDs/middlies.json";
import longiesIDs from "./poemsIDs/longies.json";

// Limit ID's to tg compatible length
const allIDs = [...middliesIDs, ...shortiesIDs]

export { allIDs, longiesIDs, middliesIDs, shortiesIDs };
