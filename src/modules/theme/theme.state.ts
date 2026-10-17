import { atom, useAtom } from "jotai";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// 保存済みの設定があればそれを使い、なければ OS の設定(prefers-color-scheme)に合わせる。
// ※ index.html のちらつき防止スクリプトも同じルールで決めている。
const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage が使えない環境では OS の設定に従う
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const themeAtom = atom<Theme>(getInitialTheme());

export const useTheme = () => {
  const [theme, setThemeState] = useAtom(themeAtom);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    // CSS側が見ている目印: <html data-theme="dark">
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できなくても、今のセッション中は切り替わる
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
};
