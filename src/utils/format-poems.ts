import { Poem } from "../main";

export function formatPoems(poem: Poem, chunk?: number) {
  const titleChain = poem.titleChain;
  const year = poem.year ? ` (${poem.year})` : "";

  return (
    `${titleChain.join(", ")}

${poem.text}

        José Lezama Lima — ${titleChain[0]}${year}
`
  );
}