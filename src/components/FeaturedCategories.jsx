import React from "react";
import "./featured-categories.css";

const categories = [
  { title: "SACCHI", img: "/images/sacchi.png" },
  { title: "LOAFER", img: "/images/loafer.png" },
  { title: "FORMAL SHOES", img: "/images/formal-shoes.png" },
  { title: "CASUAL SHOES", img: "/images/casual-shoes.png" },
  { title: "CYCLE SHOES", img: "/images/cycle-shoes.png" },
  { title: "HALF LOAFER", img: "/images/half-loafer.png" },
  { title: "TARSAL", img: "/images/tarsal.png" },
  { title: "SANDAL", img: "/images/sandal.png" },
  { title: "BOOT", img: "/images/boot.png" },
  { title: "WALLETS", img: "/images/wallets.png", logoText: "NEXO" },
];

function BrandMark({ variant = "R" }) {
  return (
    <div className="fc-brand" aria-label="brand mark">
      <span className="fc-brand-mark">R</span>
      {variant !== "R" && <span className="fc-brand-text">{variant}</span>}
    </div>
  );
}

export default function FeaturedCategories() {
  return (
    <section className="fc-wrap">
      <header className="fc-header">
        <h2 className="fc-title">FEATURED CATEGORIES</h2>
        <div className="fc-underline" />
      </header>

      <div className="fc-grid">
        {categories.map((c) => (
          <button key={c.title} className="fc-card" type="button">
            <div className="fc-inner">
              <div className="fc-logo">
                {c.logoText ? <BrandMark variant={c.logoText} /> : <BrandMark />}
              </div>

              <div className="fc-imgFrame">
                {/* Replace with your real product images */}
                <img
                  className="fc-img"
                  src={c.img}
                  alt={c.title}
                  onError={(e) => {
                    // fallback if image not found
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>

            <div className="fc-label">{c.title}</div>
          </button>
        ))}
      </div>

      <button className="fc-showMore" type="button">
        <span>Show More</span>
        <svg
          className="fc-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </section>
  );
}
