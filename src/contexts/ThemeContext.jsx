import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('apex-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    try { 
      localStorage.setItem('apex-theme', theme); 
    } catch {
      // ignore quota exceeded or disabled cookies
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    // Add transition class temporarily for smooth animation
    document.documentElement.classList.add('theme-transition');
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 400);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
