import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, ChevronDown } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import type { Theme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];

  const currentOption = options.find((opt) => opt.value === theme) || options[2];
  const Icon = currentOption.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Icon className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">{currentOption.label}</span>
        <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg focus:outline-none animate-in fade-in zoom-in-95 duration-100">
          <div className="flex flex-col gap-0.5" role="menu">
            {options.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                  role="menuitem"
                >
                  <OptionIcon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-slate-400 dark:text-slate-500"}`} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
