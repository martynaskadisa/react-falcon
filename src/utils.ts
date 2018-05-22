export function* colorGenerator() {
  const getValue = () => Math.round(255 * Math.random());
  while (true) {
    yield `rgb(${getValue()}, ${getValue()}, ${getValue()})`;
  }
}

export function* imageGenerator() {
  while (true) {
    yield `https://source.unsplash.com/random/40${Math.round(
      Math.random() * 10
    )}x30${Math.round(Math.random() * 10)}?v=${Math.random()}`;
  }
}
