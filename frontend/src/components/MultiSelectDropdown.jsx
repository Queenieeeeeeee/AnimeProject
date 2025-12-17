// src/components/MultiSelectDropdown.jsx
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function MultiSelectDropdown({ 
  options, 
  selected = [], 
  onChange, 
  placeholder = "Select options",
  label = "Options"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    if (selected.includes(value)) {
      // Remove from selection
      onChange(selected.filter(item => item !== value));
    } else {
      // Add to selection
      onChange([...selected, value]);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium mb-1">{label}</label>
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-left flex items-center justify-between"
      >
        <span className="truncate">
          {selected.length === 0 
            ? placeholder 
            : `${selected.length} selected`
          }
        </span>
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Selected Tags Preview (below button) */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.map(item => (
            <span 
              key={item}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(item);
                }}
                className="hover:text-red-600 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Clear All Button */}
          {selected.length > 0 && (
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear All ({selected.length})
              </button>
            </div>
          )}

          {/* Options List */}
          {options.map(option => {
            const isSelected = selected.includes(option.name);
            return (
              <label
                key={option.id}
                className={`
                  flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 transition
                  ${isSelected ? 'bg-blue-50' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(option.name)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className={`text-sm ${isSelected ? 'font-medium text-blue-800' : 'text-gray-900'}`}>
                  {option.name}
                </span>
              </label>
            );
          })}

          {/* No options message */}
          {options.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

MultiSelectDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
};

export default MultiSelectDropdown;