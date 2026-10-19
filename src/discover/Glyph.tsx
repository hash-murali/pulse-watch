const paths = {
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-2 5 6 6",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  shuffle:
    "M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3-2 4-4m4-4c1-2 2-4 4-4h3m-4-4 4 4-4 4",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
  chat: "M21 11a9 8 0 0 1-9 8H7l-5 3 2-6a8 8 0 1 1 17-5",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10",
  pulse: "M2 12h5l3-8 4 16 3-8h5",
  flame: "M12 2c2 6-5 6-3 12 1-3 4-3 5-6 6 6 7 14-2 14S1 12 7 8c-1 5 3 5 5-6",
  code: "m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 18",
  close: "m6 6 12 12M6 18 18 6",
};
export type GlyphName = keyof typeof paths;
export function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
