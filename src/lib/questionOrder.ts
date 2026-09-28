import type { Question } from "../data/questions";

/** Shuffle answer positions for a session without changing them on reload. */
export function orderedOptions(
  question: Question,
  sessionSeed: number,
): Question["options"] {
  const options = [...question.options];
  let state = 2166136261;
  for (const character of `${question.id}:${sessionSeed}`) {
    state ^= character.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }
  for (let index = options.length - 1; index > 0; index--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const other = (state >>> 0) % (index + 1);
    [options[index], options[other]] = [options[other], options[index]];
  }
  return options;
}
