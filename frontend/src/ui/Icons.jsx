import React from "react";

export function CartIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 7h14l-1.6 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L5.2 3.7A1.7 1.7 0 0 0 3.5 2H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10.8 18.2a7.4 7.4 0 1 1 0-14.8 7.4 7.4 0 0 1 0 14.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SunIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M12 2v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 19.5V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 12h2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.5 12H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.2 4.2 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 18l1.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.8 4.2 18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 18l-1.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 14.2A7.5 7.5 0 0 1 9.8 3 6.6 6.6 0 1 0 21 14.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

