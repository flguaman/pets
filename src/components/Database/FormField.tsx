import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';

interface FormFieldProps {
  label: string;
  type: 'text' | 'tel' | 'number' | 'select' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  rows?: number;
  options?: { value: string; label: string }[];
}

export function FormField({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  rows,
  options
}: FormFieldProps) {
  const { deviceMode } = useSettingsStore();

  const inputClasses = `w-full bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
    deviceMode === 'mobile' ? 'p-2 text-sm' : 'p-2.5'
  }`;

  const labelClasses = `block font-medium text-gray-300 mb-1 sm:mb-2 ${
    deviceMode === 'mobile' ? 'text-xs sm:text-sm' : 'text-sm'
  }`;

  return (
    <div>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          required={required}
          disabled={disabled}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
        />
      )}
    </div>
  );
}