interface TiltUpIconProps {
  size?: number;
  className?: string;
}

export const TiltUpIcon = ({ size = 24, className = "" }: TiltUpIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Phone body (landscape) */}
    <rect x="3" y="6" width="18" height="12" rx="2" />
    {/* Screen */}
    <rect x="5" y="8" width="14" height="8" rx="0.5" strokeWidth="0" fill="currentColor" opacity="0.15" />
    {/* Top arrow arc (tilt up / pass) */}
    <path d="M12 2 C8 2, 5 3.5, 5 5" strokeWidth="1.5" />
    <polyline points="4,3 5,5 7,4.2" strokeWidth="1.5" />
    <path d="M12 2 C16 2, 19 3.5, 19 5" strokeWidth="1.5" />
    <polyline points="20,3 19,5 17,4.2" strokeWidth="1.5" />
    {/* Bottom arrow arc (tilt down / found) */}
    <path d="M12 22 C8 22, 5 20.5, 5 19" strokeWidth="1.5" />
    <polyline points="4,21 5,19 7,19.8" strokeWidth="1.5" />
    <path d="M12 22 C16 22, 19 20.5, 19 19" strokeWidth="1.5" />
    <polyline points="20,21 19,19 17,19.8" strokeWidth="1.5" />
  </svg>
);
