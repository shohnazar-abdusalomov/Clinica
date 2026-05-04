import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';
export type Language = 'uz' | 'ru' | 'en';

interface ThemeContextType {
  theme: Theme;
  accent: AccentColor;
  language: Language;
  isDark: boolean;
  setTheme: (t: Theme) => void;
  setAccent: (a: AccentColor) => void;
  setLanguage: (l: Language) => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

const accentVars: Record<AccentColor, string> = {
  blue:    '#3B82F6',
  emerald: '#10B981',
  violet:  '#8B5CF6',
  amber:   '#F59E0B',
  rose:    '#F43F5E',
  cyan:    '#06B6D4',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem('theme') as Theme) || 'light'
  );
  const [accent, setAccentState] = useState<AccentColor>(() =>
    (localStorage.getItem('accent') as AccentColor) || 'blue'
  );
  const [language, setLanguageState] = useState<Language>(() =>
    (localStorage.getItem('language') as Language) || 'uz'
  );

  const getSystemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', accentVars[accent]);
    root.style.setProperty('--accent-color-light', accentVars[accent] + '20');
  }, [accent]);

  useEffect(() => {
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        if (mq.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem('theme', t); };
  const setAccent = (a: AccentColor) => { setAccentState(a); localStorage.setItem('accent', a); };
  const setLanguage = (l: Language) => { setLanguageState(l); localStorage.setItem('language', l); };

  return (
    <ThemeContext.Provider value={{ theme, accent, language, isDark, setTheme, setAccent, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
