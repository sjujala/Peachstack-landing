import React from 'react';

export default function PeachLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Peachstack logo"
    >
      <path
        d="M20 4C12 4 6 10 6 18C6 26 12 36 20 36C28 36 34 26 34 18C34 10 28 4 20 4Z"
        fill="#f97316"
        opacity="0.9"
      />
      <rect x="12" y="14" width="16" height="3" rx="1.5" fill="white" />
      <rect x="12" y="20" width="16" height="3" rx="1.5" fill="white" />
      <rect x="12" y="26" width="10" height="3" rx="1.5" fill="white" />
      <path d="M20 2C20 2 22 0 24 1" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 2C20 2 19 0 17 0.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
