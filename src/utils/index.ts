export function wait(ms: number): Promise<undefined> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function retry<R>(
  fn: () => Promise<R>,
  finished: (value: R) => boolean,
  every: number | ((index: number, value: R) => number),
) {
  const delay = typeof every === "number" ? () => every : every;

  let value = await fn();
  let index = 1;
  while (!finished(value)) {
    await wait(delay(index, value));
    value = await fn();
    index++;
  }

  return value;
}
