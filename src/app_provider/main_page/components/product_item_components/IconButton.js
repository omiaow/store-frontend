import React from 'react';

export default function IconButton({
  onClick,
  label,
  title,
  disabled = false,
  className = 'main-page-iconButton',
  children,
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={label}
      title={title ?? label}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

