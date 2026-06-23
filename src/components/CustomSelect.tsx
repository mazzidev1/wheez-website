import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  icon?: React.ReactNode;
  variant?: 'outline' | 'transparent';
}

export default function CustomSelect({ value, onChange, options, className = '', icon, variant = 'outline' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left outline-none transition-colors flex items-center justify-between ${
          variant === 'outline' 
            ? 'bg-brand-base border border-black/5 rounded-2xl p-4 text-sm font-medium focus:border-brand-accent' 
            : 'bg-transparent text-base md:text-lg font-medium outline-none cursor-pointer text-brand-text py-1'
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[#595751] text-white rounded-2xl shadow-xl py-2 overflow-hidden border border-black/10"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-base md:text-lg flex items-center gap-3 hover:bg-white/10 transition-colors ${
                  value === option.value ? 'font-medium text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {value === option.value && <Check strokeWidth={3} className="w-4 h-4" />}
                </div>
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
