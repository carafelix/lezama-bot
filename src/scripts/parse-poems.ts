interface Heading {
  level: number;
  text: string;
  titleCase: string;
  hasVerse: boolean;
}

interface Poem {
  id: number;
  titleChain: string[];
  text: string;
  year: string | null;
  length: number;
}

const HEADING_REGEX = /^(#{1,6})\s+(.*)$/;
const VERSE_REGEX = /\{\.verse\}/;

function stripVerse(str: string): string {
  return str.replace(/\s+\{\.verse\}/, "").replace(/\{\.verse\}/, "");
}

function isRomanNumeral(str: string): boolean {
  return /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(str);
}

function toTitleCase(str: string): string {
  if (isRomanNumeral(str)) return str;
  return str
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function parseGordoMD(content: string): Poem[] {
  const lines = content.split("\n");
  const poems: Poem[] = [];
  let currentPoem: Partial<Poem> = {};
  let currentHeadings: Heading[] = [];
  let inPoem = false;
  let poemTextLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(HEADING_REGEX);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const rawText = headingMatch[2].trim();
      const hasVerse = VERSE_REGEX.test(line);

      // If we were collecting poem text and hit a new heading, save the poem
      if (inPoem && poemTextLines.length > 0) {
        poems.push({
          id: poems.length + 1,
          titleChain: currentHeadings.map((h) => stripVerse(h.titleCase)),
          text: poemTextLines.join("\n").trim(),
          year: currentPoem.year || null,
          length: poemTextLines.join("\n").length,
        });
        poemTextLines = [];
        inPoem = false;
      }

      // Update heading stack - keep only ancestors at appropriate level
      if (level <= 5) {
        currentHeadings = currentHeadings
          .slice(0, level - 1)
          .concat({ level, text: stripVerse(rawText), titleCase: toTitleCase(stripVerse(rawText)), hasVerse });
      } else {
        currentHeadings.push({ level, text: stripVerse(rawText), titleCase: toTitleCase(stripVerse(rawText)), hasVerse });
      }

      // If this heading has {.verse}, it's a poem start
      if (hasVerse) {
        inPoem = true;
        currentPoem = { titleChain: currentHeadings.map((h) => h.titleCase) };
      }
    } else if (inPoem) {
      // Check for year line (standalone Roman numeral or month format)
      const trimmed = line.trim();
      if (
        trimmed &&
        !line.startsWith("#") &&
        !headingMatch &&
        // Roman numeral pattern like MCMXXXI or MDCCCLXXXVII
        /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(
          trimmed.replace(/\s/g, ""),
        ) ||
        // Month format like —Enero 1931— or —Julio, 1931—
        /^--—[^—]+—\d{4}—$/.test(trimmed) ||
        /^--—[^—]+, \d{4}—$/.test(trimmed)
      ) {
        currentPoem.year = trimmed;
      } else {
        poemTextLines.push(line);
      }
    }
  }

  // Save last poem
  if (inPoem && poemTextLines.length > 0) {
    poems.push({
      id: poems.length + 1,
      titleChain: currentHeadings.map((h) => h.titleCase),
      text: poemTextLines.join("\n").trim(),
      year: currentPoem.year || null,
      length: poemTextLines.join("\n").length,
    });
  }

  return poems;
}

function categorizePoems(poems: Poem[]): {
  shorties: Poem[];
  middlies: Poem[];
  longies: Poem[];
} {
  const shorties: Poem[] = [];
  const middlies: Poem[] = [];
  const longies: Poem[] = [];

  for (const poem of poems) {
    if (poem.length < 1000) {
      shorties.push(poem);
    } else if (poem.length <= 3000) {
      middlies.push(poem);
    } else {
      longies.push(poem);
    }
  }

  return { shorties, middlies, longies };
}

// Read gordo.md
import { readFile } from "fs/promises";
import { writeFile } from "fs/promises";

async function main() {
  const content = await readFile("./src/data/gordo.md", "utf-8");
  const poems = parseGordoMD(content);
  const { shorties, middlies, longies } = categorizePoems(poems);

  // Write all poems
  await writeFile("./src/data/poems.json", JSON.stringify(poems, null, 2));
  await writeFile("./src/data/poemsIDs/shorties.json", JSON.stringify(shorties.map((p) => p.id), null, 2));
  await writeFile("./src/data/poemsIDs/middlies.json", JSON.stringify(middlies.map((p) => p.id), null, 2));
  await writeFile("./src/data/poemsIDs/longies.json", JSON.stringify(longies.map((p) => p.id), null, 2));

  console.log(`Parsed ${poems.length} poems total:`);
  console.log(`  Shorties: ${shorties.length}`);
  console.log(`  Middlies: ${middlies.length}`);
  console.log(`  Longies: ${longies.length}`);
}

main().catch((err) => {
  console.error("Error parsing gordo.md:", err);
  process.exit(1);
});