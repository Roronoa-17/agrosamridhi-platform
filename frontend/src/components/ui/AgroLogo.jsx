export default function AgroLogo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Top Yellow Sprout Bulb */}
      <path
        d="M20 6C24 6 26.5 10 26.5 14C26.5 17.5 23.5 19.5 20 19.5C16.5 19.5 13.5 17.5 13.5 14C13.5 10 16 6 20 6Z"
        fill="#f5a623"
      />
      {/* Bottom Green Leaf Body */}
      <path
        d="M20 17.5C25.5 17.5 28.5 22.5 28.5 27C28.5 31 24.5 34 20 34C15.5 34 11.5 31 11.5 27C11.5 22.5 14.5 17.5 20 17.5Z"
        fill="#066f44"
      />
      {/* Center White Stem Accent */}
      <path
        d="M20 7V33"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
