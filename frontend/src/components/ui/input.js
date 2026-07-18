import React from 'react';

export const Input = ({ type = "text", value, onChange, placeholder }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border rounded-md p-2 w-full"
    />
  );
};
