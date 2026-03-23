export const CIGARETTE_BRANDS = [
  "mildseven",
  "marlboro",
  "esse",
  "dunhill",
  "parliament",
  "raison",
  "this",
  "bohem",
  "camel",
] as const;

export type CigaretteBrand = (typeof CIGARETTE_BRANDS)[number];

export const CIGARETTE_LABEL: Record<CigaretteBrand, string> = {
  mildseven: "마일드세븐",
  marlboro: "말보로",
  esse: "에쎄",
  dunhill: "던힐",
  parliament: "팔리아멘트",
  raison: "레종",
  this: "디스",
  bohem: "보헴",
  camel: "카멜",
};

export const CIGARETTE_STYLE: Record<
  CigaretteBrand,
  { code: string; body: string; band: string }
> = {
  mildseven: { code: "MS", body: "#d5dde8", band: "#2f6fb5" },
  marlboro: { code: "MB", body: "#f6f0e8", band: "#c4342e" },
  esse: { code: "ES", body: "#e8f4ef", band: "#2d946d" },
  dunhill: { code: "DH", body: "#e9e8eb", band: "#42484f" },
  parliament: { code: "PM", body: "#ecf2f7", band: "#3a79b4" },
  raison: { code: "RS", body: "#e5e3f1", band: "#5b4c93" },
  this: { code: "TS", body: "#f1ece3", band: "#9a5a2d" },
  bohem: { code: "BH", body: "#ece5d8", band: "#8c744b" },
  camel: { code: "CM", body: "#f2ead5", band: "#b7782f" },
};

export const CIGARETTE_SPRITE_POS: Record<
  CigaretteBrand,
  { row: 0 | 1 | 2; col: 0 | 1 | 2 }
> = {
  mildseven: { row: 0, col: 0 },
  marlboro: { row: 0, col: 1 },
  esse: { row: 0, col: 2 },
  dunhill: { row: 1, col: 0 },
  parliament: { row: 1, col: 1 },
  raison: { row: 1, col: 2 },
  this: { row: 2, col: 0 },
  bohem: { row: 2, col: 1 },
  camel: { row: 2, col: 2 },
};

export function isCigaretteBrand(v: unknown): v is CigaretteBrand {
  return typeof v === "string" && (CIGARETTE_BRANDS as readonly string[]).includes(v);
}
