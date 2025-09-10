// Select.jsx

import React from 'react';  

const Select = ({ 
  options, 
  value, 
  onChange, 
  children, 
  className = "", 
  ...props 
}) => {
  return (
    <select 
      value={value} 
      onChange={onChange} 
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    >
      {options ? (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      ) : (
        children
      )}
    </select>
  );
};

export default Select;