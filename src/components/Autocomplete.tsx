import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, Search, X } from 'lucide-react';

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
  icon,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(value); // Reset search term to current value if closed without selection
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options.slice(0, 50)); // Show first 50 if empty
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 50)); // Limit to 50 for performance
    }
  }, [searchTerm, options]);

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      {label && <label className="text-sm font-bold text-slate-700">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type="text"
          required={required}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white py-3 pr-10 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all",
            icon ? "pl-10" : "pl-4"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onChange('');
                setIsOpen(true);
              }}
              className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown 
            size={18} 
            className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} 
          />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-100 bg-white p-1 shadow-xl">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                value === option ? "bg-peach-50 text-peach-600 font-bold" : "text-slate-600"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && filteredOptions.length === 0 && searchTerm.trim() !== '' && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-100 bg-white p-4 shadow-xl text-center">
          <p className="text-sm text-slate-400 italic">No results found for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
