import React from "react";

export default function EmptyCartIllustration() {
  return (
    <svg viewBox="0 0 560 320" className="h-auto w-full" role="img" aria-label="Empty cart illustration">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ff6b35" />
          <stop offset="0.6" stopColor="#ff6b35" stopOpacity="0.85" />
          <stop offset="1" stopColor="#16a34a" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="560" height="320" rx="28" fill="#fff" />
      <path
        d="M56 248c46-28 92-42 138-42 92 0 138 56 230 56 38 0 74-10 108-30"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <g transform="translate(140 72)">
        <path
          d="M64 64h220l-20 112H88L64 64Z"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path d="M48 40h36" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
        <circle cx="112" cy="206" r="18" fill="#0f172a" opacity="0.12" />
        <circle cx="240" cy="206" r="18" fill="#0f172a" opacity="0.12" />
        <path
          d="M136 96c16-18 38-26 66-26 28 0 50 8 66 26"
          fill="none"
          stroke="url(#g)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M128 132h160"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M164 32c14-10 28-14 42-14 16 0 32 4 50 14"
          fill="none"
          stroke="#ff6b35"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
    </svg>
  );
}

