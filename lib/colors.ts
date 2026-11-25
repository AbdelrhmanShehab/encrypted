/** Best-effort swatch colour for a variant colour name (catalog stores names, not hex values). */
const named: Record<string, string> = {
  white: "#f5f5f5", offwhite: "#ecebe4", cream: "#f1e8d0", beige: "#d9c7a5", black: "#111111", gray: "#9a9a9a", grey: "#9a9a9a", charcoal: "#444444",
  navy: "#1b2a4a", "blue navy": "#1b2a4a", blue: "#2a64b8", sky: "#8ec5ea", "light blue": "#9cc4e6", teal: "#1f7a7a", green: "#2e8b57", olive: "#6b6b2f", khaki: "#b5a56a",
  "dark green": "#0f4a2a", red: "#c62828", burgundy: "#6d1230", maroon: "#6d1230", pink: "#f0a3bd", purple: "#6a3fa0", yellow: "#f2d338", orange: "#ee8a2c", brown: "#6b4426", camel: "#b98b52", tan: "#c8a37a", silver: "#c0c0c0", gold: "#c9a227",
};
export function swatch(name: string): string {
  const key = (name || "").trim().toLowerCase();
  if (named[key]) return named[key];
  const last = key.split(/[\s/-]+/).pop() || "";
  if (named[last]) return named[last];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) return key;
  return "#777777";
}
