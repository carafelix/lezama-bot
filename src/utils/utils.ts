import { formatPoems } from "./format-poems";
import { shuffleArray } from "./shuffle-arr";

export { formatPoems };
export { shuffleArray };
export { rand };

/**
 * returns a random whole number between 0 and n-1 ()
 * @param n number
 * @returns number
 */
function rand(n: number) {
  return Math.floor(Math.random() * n);
}
