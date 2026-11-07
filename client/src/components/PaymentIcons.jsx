/**
 * Authentic vector icons for UK payment methods:
 * 1. VisaCardIcon: Visa Debit & Credit card with iconic blue/gold branding,
 *    microchip, contactless symbol, and official VISA wordmark.
 * 2. MasterCardIcon: Mastercard with the world-famous overlapping red and orange
 *    circles, microchip, contactless wave, and lowercase wordmark.
 * 3. ApplePayIcon: Official Apple Pay badge styling with white apple silhouette and Pay wordmark.
 * 4. ContactlessIcon: Universal contactless payment wave symbol.
 */

export function VisaCardIcon({ className = "", size = "default", ...props }) {
  // size: "compact" (inline 34x21), "default" (48x30), "large" (80x50), "card" (full preview 140x88)
  const dimensions = {
    compact: { width: 34, height: 21 },
    default: { width: 48, height: 30 },
    large: { width: 80, height: 50 },
    card: { width: 140, height: 88 },
  }[size] || { width: 48, height: 30 };

  return (
    <svg
      className={`payment-icon payment-icon--visa ${className}`}
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 100 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Visa card"
      {...props}
    >
      <defs>
        <linearGradient id="visaCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1f71" />
          <stop offset="60%" stopColor="#10144d" />
          <stop offset="100%" stopColor="#0a0c30" />
        </linearGradient>
        <clipPath id="visaCardClip">
          <rect width="100" height="64" rx="6" />
        </clipPath>
      </defs>

      {/* Card Base */}
      <rect width="100" height="64" rx="6" fill="url(#visaCardBg)" />

      {/* Card Contents */}
      <g clipPath="url(#visaCardClip)">
        {/* Subtle decorative angle sheen */}
        <path
          d="M -10 64 L 60 -10 L 85 -10 L 15 64 Z"
          fill="#ffffff"
          opacity="0.06"
        />

        {/* Smartcard Microchip (left side) */}
        <rect
          x="10"
          y="23"
          width="15"
          height="12"
          rx="2"
          fill="#f4d06f"
          stroke="#d4af37"
          strokeWidth="0.5"
        />
        <path
          d="M 10 29 L 25 29 M 17.5 23 L 17.5 35 M 13.5 23 L 13.5 29 M 21.5 23 L 21.5 29 M 13.5 29 L 13.5 35 M 21.5 29 L 21.5 35"
          stroke="#9a7b1c"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        {/* Contactless waves symbol */}
        <g
          transform="translate(30, 24) scale(0.75)"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        >
          <path d="M 0 3 A 4 4 0 0 1 0 11" />
          <path d="M 3.5 1 A 7.5 7.5 0 0 1 3.5 13" />
          <path d="M 7 -1 A 11 11 0 0 1 7 15" />
        </g>

        {/* VISA Wordmark (bottom right) */}
        <g transform="translate(48, 41) scale(0.95)">
          {/* Gold accent flick on V */}
          <path
            d="M 2.5 1.5 L 6.5 1.5 L 3.8 14 L 0 14 Z"
            fill="#f7b600"
          />
          <text
            x="4"
            y="13"
            fill="#ffffff"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontSize="15"
            fontWeight="900"
            fontStyle="italic"
            letterSpacing="0.8px"
          >
            VISA
          </text>
        </g>

        {/* Subtle debit tag */}
        <text
          x="10"
          y="15"
          fill="#cbd5e1"
          fontFamily="system-ui, sans-serif"
          fontSize="6.5"
          fontWeight="700"
          letterSpacing="0.8px"
          opacity="0.85"
        >
          DEBIT / CREDIT
        </text>
      </g>
    </svg>
  );
}

export function MasterCardIcon({ className = "", size = "default", ...props }) {
  const dimensions = {
    compact: { width: 34, height: 21 },
    default: { width: 48, height: 30 },
    large: { width: 80, height: 50 },
    card: { width: 140, height: 88 },
  }[size] || { width: 48, height: 30 };

  return (
    <svg
      className={`payment-icon payment-icon--mastercard ${className}`}
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 100 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mastercard"
      {...props}
    >
      <defs>
        <linearGradient id="mcCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#25252b" />
          <stop offset="70%" stopColor="#18181e" />
          <stop offset="100%" stopColor="#0d0d12" />
        </linearGradient>
        <clipPath id="mcCardClip">
          <rect width="100" height="64" rx="6" />
        </clipPath>
      </defs>

      {/* Card Base */}
      <rect width="100" height="64" rx="6" fill="url(#mcCardBg)" />

      {/* Card Contents */}
      <g clipPath="url(#mcCardClip)">
        {/* Subtle diagonal sheen */}
        <path
          d="M 15 -10 L 95 70 L 115 70 L 35 -10 Z"
          fill="#ffffff"
          opacity="0.04"
        />

        {/* Smartcard Microchip (left side) */}
        <rect
          x="10"
          y="23"
          width="15"
          height="12"
          rx="2"
          fill="#f4d06f"
          stroke="#d4af37"
          strokeWidth="0.5"
        />
        <path
          d="M 10 29 L 25 29 M 17.5 23 L 17.5 35 M 13.5 23 L 13.5 29 M 21.5 23 L 21.5 29 M 13.5 29 L 13.5 35 M 21.5 29 L 21.5 35"
          stroke="#9a7b1c"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        {/* Contactless waves symbol */}
        <g
          transform="translate(30, 24) scale(0.75)"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        >
          <path d="M 0 3 A 4 4 0 0 1 0 11" />
          <path d="M 3.5 1 A 7.5 7.5 0 0 1 3.5 13" />
          <path d="M 7 -1 A 11 11 0 0 1 7 15" />
        </g>

        {/* Mastercard Interlocking Circles */}
        <g transform="translate(56, 32)">
          {/* Red circle */}
          <circle cx="10" cy="12" r="10.5" fill="#eb001b" />
          {/* Yellow circle */}
          <circle cx="21" cy="12" r="10.5" fill="#f79e1b" opacity="0.95" />
          {/* Overlap intersection */}
          <path
            d="M 15.5 4.3 A 10.5 10.5 0 0 1 20.5 12 A 10.5 10.5 0 0 1 15.5 19.7 A 10.5 10.5 0 0 1 10.5 12 A 10.5 10.5 0 0 1 15.5 4.3 Z"
            fill="#ff5f00"
          />
        </g>

        {/* mastercard wordmark */}
        <text
          x="10"
          y="15"
          fill="#f1f5f9"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.5"
          fontWeight="700"
          letterSpacing="0.8px"
          opacity="0.85"
        >
          MASTERCARD
        </text>
      </g>
    </svg>
  );
}

export function ApplePayIcon({ className = "", size = "default", ...props }) {
  const dimensions = {
    compact: { width: 34, height: 21 },
    default: { width: 48, height: 30 },
    large: { width: 80, height: 50 },
    card: { width: 140, height: 88 },
  }[size] || { width: 48, height: 30 };

  return (
    <svg
      className={`payment-icon payment-icon--applepay ${className}`}
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 100 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Apple Pay"
      {...props}
    >
      <defs>
        <clipPath id="applePayCardClip">
          <rect width="100" height="64" rx="6" />
        </clipPath>
      </defs>

      {/* Card Base in deep Apple black */}
      <rect
        width="100"
        height="64"
        rx="6"
        fill="#0d0d0d"
        stroke="#2a2a2a"
        strokeWidth="1"
      />

      <g clipPath="url(#applePayCardClip)">
        {/* Subtle sleek gradient highlight */}
        <path
          d="M -10 -10 L 110 -10 L 110 20 L -10 32 Z"
          fill="#ffffff"
          opacity="0.05"
        />

        {/* Contactless waves symbol top right */}
        <g
          transform="translate(80, 14) scale(0.65)"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        >
          <path d="M 0 3 A 4 4 0 0 1 0 11" />
          <path d="M 3.5 1 A 7.5 7.5 0 0 1 3.5 13" />
          <path d="M 7 -1 A 11 11 0 0 1 7 15" />
        </g>

        {/* Apple Logo + Pay wordmark */}
        <g transform="translate(22, 23)">
          {/* Apple Logo */}
          <path
            d="M 12.3 8.8 C 12.3 6.9 13.9 5.8 14.0 5.7 C 13.1 4.4 11.7 4.2 11.2 4.2 C 10.0 4.0 8.8 4.9 8.2 4.9 C 7.6 4.9 6.6 4.2 5.6 4.2 C 4.3 4.2 3.1 4.9 2.5 6.0 C 1.1 8.3 2.1 11.8 3.5 13.8 C 4.2 14.8 5.0 15.9 6.1 15.8 C 7.1 15.8 7.5 15.2 8.8 15.2 C 10.0 15.2 10.4 15.8 11.5 15.8 C 12.6 15.8 13.3 14.8 14.0 13.8 C 14.8 12.6 15.1 11.5 15.2 11.4 C 15.1 11.3 12.3 10.3 12.3 8.8 Z M 10.5 2.8 C 11.0 2.1 11.4 1.2 11.3 0.2 C 10.5 0.3 9.5 0.8 9.0 1.4 C 8.5 2.0 8.1 2.9 8.2 3.9 C 9.1 4.0 10.0 3.4 10.5 2.8 Z"
            fill="#ffffff"
          />
          {/* Pay Text */}
          <text
            x="18.5"
            y="14.2"
            fill="#ffffff"
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif"
            fontSize="14.5"
            fontWeight="600"
            letterSpacing="-0.2px"
          >
            Pay
          </text>
        </g>
      </g>
    </svg>
  );
}

export function ContactlessIcon({ className = "", size = 20, ...props }) {
  return (
    <svg
      className={`payment-icon payment-icon--contactless ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Contactless payment"
      {...props}
    >
      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
    </svg>
  );
}

// Backward-compatible alias in case any legacy code imports OysterCardIcon
export function OysterCardIcon(props) {
  return <VisaCardIcon {...props} />;
}
