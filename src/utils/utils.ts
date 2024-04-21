import { formatPoems } from './format-poems';
import { shuffleArray } from './shuffle-arr';

export { formatPoems }
export { shuffleArray }
export { rand }

function rand(n: number) {
    return Math.floor(Math.random() * n)
}