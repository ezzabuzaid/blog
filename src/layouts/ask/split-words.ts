export const splitWords = (str: string) => {
  const segmenter = new Intl.Segmenter([], { granularity: "word" });
  const segments = segmenter.segment(str);
  return Array.from(segments).map(segment => segment.segment);
};
