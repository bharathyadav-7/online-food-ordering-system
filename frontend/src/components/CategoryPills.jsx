import React from "react";

export default function CategoryPills({ categories, value, onChange }) {
  return (
    <div className="scrollbar-none flex max-w-full items-center gap-2 overflow-x-auto py-1">
      <button
        onClick={() => onChange?.("")}
        className={`chip whitespace-nowrap ${value === "" ? "chip-active" : ""}`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onChange?.(c)}
          className={`chip whitespace-nowrap ${value === c ? "chip-active" : ""}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

