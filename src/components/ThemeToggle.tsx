import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string; onToggle?: (isDark: boolean) => void }> = ({ className = '', onToggle }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mi_feria_theme');
      if (saved) return saved === 'dark';
      return true; // Default to Dark OLED
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    const metaTheme = document.getElementById('theme-color-meta');
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('mi_feria_theme', 'dark');
      if (metaTheme) metaTheme.setAttribute('content', '#050505');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mi_feria_theme', 'light');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }
    if (onToggle) onToggle(isDark);
  }, [isDark, onToggle]);

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={() => setIsDark(!isDark)}
      aria-label="Cambiar tema de color"
      title={isDark ? "Cambiar a modo Claro" : "Cambiar a modo Oscuro"}
      className={`relative p-2 rounded-xl transition-all duration-200 border flex items-center justify-center ${
        isDark
          ? 'bg-[#0c0c0e] border-[#1f1f23] text-cyan-400 hover:border-cyan-500/50 hover:bg-[#15151a]'
          : 'bg-white border-slate-200 text-amber-500 hover:border-amber-400 hover:bg-slate-50 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-cyan-400 transition-transform hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
      )}
    </button>
  );
};
