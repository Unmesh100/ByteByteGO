/** Zero-pad chapter and volume numbers: 4 -> "04". */
export const pad = (n: number) => String(n).padStart(2, "0");

export type BookStyle = React.CSSProperties & { "--book"?: string };

export const bookStyle = (accent: string): BookStyle => ({ "--book": accent });

/** Window event that opens the full-screen volume menu from anywhere. */
export const OPEN_MENU_EVENT = "bbg:open-menu";
