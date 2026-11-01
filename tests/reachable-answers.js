import { getQuestions } from '../src/data/questions.js';

export function pruneAnswers(input) {
  const answers = { ...input };
  for (;;) {
    const visible = new Set(getQuestions(answers).map((question) => question.id));
    const hidden = Object.keys(answers).filter((id) => !visible.has(id));
    if (!hidden.length) return answers;
    for (const id of hidden) delete answers[id];
  }
}

export function* reachableAnswers(domains, defaults = {}) {
  const entries = Object.entries(domains);
  function* visit(index, answers) {
    if (index === entries.length) {
      yield pruneAnswers(answers);
      return;
    }
    const [id, selectedValues] = entries[index];
    const question = getQuestions(answers).find((question) => question.id === id);
    if (!question) {
      yield* visit(index + 1, answers);
      return;
    }
    const values = selectedValues || question.options.map((option) => option.value);
    for (const value of values) yield* visit(index + 1, { ...answers, [id]: value });
  }
  yield* visit(0, defaults);
}
