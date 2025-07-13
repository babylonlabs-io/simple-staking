export function wait(ms: number): Promise<undefined> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function retry<R>(
  fn: () => Promise<R>,
  finished: (value: R) => boolean,
  delay: number | ((index: number, value: R) => number),
  attempts = Infinity,
) {
  const getDelay = typeof delay === "number" ? () => delay : delay;
  let value = await fn();
  let index = 1;

  while (!finished(value) && index <= attempts) {
    await wait(getDelay(index, value));
    value = await fn();
    index++;
  }

  return value;
}
