import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) => {
  const baseClasses = 'input';
  const errorClasses = error ? 'input-error' : '';
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        type={type}
        className={classes}
        {...props}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

export default Input;
