import React from "react";

const Icon = ({ children, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

const LocationIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </svg>
);

const PhoneIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M7 3h3l2 5-2 1c1.2 2.6 3.4 4.8 6 6l1.2-2 5 2V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M16.5 16.5 21 21"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const CartIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M6 6h15l-1.5 9h-12L6 6Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M6 6 5 3H2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </svg>
);

const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 21s-7-4.6-9.5-9A5.7 5.7 0 0 1 12 5a5.7 5.7 0 0 1 9.5 7c-2.5 4.4-9.5 9-9.5 9Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M4 21a8 8 0 0 1 16 0"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronDown = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Header() {
  // Provided brand colors
  const primary = "#AD0101";
  const accent = "#DF263A";

  return (
    <header className="w-full">
      {/* Top notice strip */}
      <div
        className="h-7 w-full"
        style={{ backgroundColor: accent }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-end px-4">
          <p className="text-[12px] font-medium text-white/95">
            Order with confidence- Easy exchange, No worries
          </p>
        </div>
      </div>

      {/* Main header bar */}
      <div className="w-full bg-[#053A47]">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4">
          {/* Left info */}
          <div className="flex items-center gap-6 text-white/90">
            <a
              href="#"
              className="flex items-center gap-2 text-[13px] hover:text-white"
            >
              <LocationIcon />
              <span>Find Store</span>
            </a>

            <div className="h-5 w-px bg-white/25" />

            <div className="flex items-center gap-2 text-[12.5px]">
              <PhoneIcon />
              <div className="leading-tight">
                <div className="text-[11px] text-white/70">Customer Care</div>
                <div className="font-semibold">+88 01709306560</div>
              </div>
            </div>

            <span
              className="ml-2 text-[14px] font-extrabold tracking-wide"
              style={{ color: accent }}
            >
              HOT OFFER
            </span>
          </div>

          {/* Center logo */}
          <a href="#" className="flex items-center gap-2">
            <img
              src="https://orbin-beta.vercel.app/logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
          </a>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="relative hidden w-[360px] items-center md:flex">
              <span className="pointer-events-none absolute left-4 text-[#053A47]/70">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                className="h-10 w-full rounded-full bg-white pl-11 pr-4 text-[13px] text-[#053A47] placeholder:text-[#053A47]/50 outline-none ring-1 ring-white/10 focus:ring-2"
                style={{ focusRingColor: primary }}
              />
            </div>

            <button
              className="text-white/90 hover:text-white"
              aria-label="Cart"
            >
              <CartIcon />
            </button>

            <button
              className="text-white/90 hover:text-white"
              aria-label="Wishlist"
            >
              <HeartIcon />
            </button>

            <button className="flex items-center gap-2 text-white/90 hover:text-white">
              <UserIcon />
              <span className="text-[13px] font-medium">Account</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="w-full bg-white">
        <div className="mx-auto flex h-[48px] max-w-7xl items-center justify-center gap-7 px-4">
          {[
            "SACCHI",
            "LOAFER",
            "FORMAL SHOES",
            "CASUAL SHOES",
            "CYCLE SHOES",
            "HALF LOAFER",
            "TARSAL",
            "SANDAL",
            "BOOT",
            "WALLETS",
            "BELT",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[12px] font-medium tracking-wide text-[#1f2a2e] hover:underline"
              style={{ textDecorationColor: accent }}
            >
              {item}
            </a>
          ))}

          <button className="flex items-center gap-1 text-[12px] font-medium tracking-wide text-[#1f2a2e] hover:underline">
            MORE <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
