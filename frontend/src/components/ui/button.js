import React from 'react';

export const Button = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${className}`}
    >
      {children}
    </button>
  );
};
