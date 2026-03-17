import React from "react";

const InputField = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">{label}</label>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
};

export default InputField;