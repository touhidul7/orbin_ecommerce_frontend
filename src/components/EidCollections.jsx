import React, { useMemo, useRef, useState } from "react";
import "./eid-collections.css";

const products = [
  {
    id: 1,
    title: "Genuine Leather Loafer",
    code: "",
    price: 1520,
    oldPrice: 1790,
    discountText: "-15%",
    img: "/images/p1.png",
    brand: "R",
    featured: true,
  },
  {
    id: 2,
    title: "Classic Premium Black Casual",
    code: "CODE:C002B",
    price: 2116,
    oldPrice: 2490,
    discountText: "-15%",
    img: "/images/p2.png",
    brand: "R",
  },
  {
    id: 3,
    title: "Smart Genuine Leather Formal Shoe",
    code: "CODE:F007B",
    price: 2290,
    oldPrice: 2690,
    discountText: "-15%",
    img: "/images/p3.png",
    brand: "R",
  },
  {
    id: 4,
    title: "Comfortable Black Leather Formal Shoe",
    code: "",
    price: 1860,
    oldPrice: 2190,
    discountText: "-15%",
    img: "/images/p4.png",
    brand: "R",
  },
  {
    id: 5,
    title: "Classic Genuine Leather Casual",
    code: "CODE:C004C",
    price: 2125,
    oldPrice: 2500,
    discountText: "-15%",
    img: "/images/p5.png",
    brand: "NEXO",
  },
];

function formatBDT(n) {
  return `Tk ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function BrandMark({ brand }) {
  if (brand === "NEXO") {
    return (
      <div className="eid-brand eid-brand-nexo" aria-label="NEXO brand">
        <span className="eid-nexo-icon" />
        <span className="eid-nexo-text">NEXO</span>
      </div>
    );
  }
  return (
    <div className="eid-brand" aria-label="brand">
      <span className="eid-brand-box">R</span>
    </div>
  );
}

export default function EidCollections() {
  const trackRef = useRef(null);

  const [showNav, setShowNav] = useState(false);

  const featured = useMemo(() => products.find((p) => p.featured), []);
  const rest = useMemo(() => products.filter((p) => !p.featured), []);

  // Move exactly 1 item per click (uses the first visible card width + flex gap).
  const scrollOne = (dir) => {
    const track = trackRef.current;
    if (!track) return;

    // Find first card inside the track
    const card = track.querySelector(".eid-card");
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;

    // Get the flex gap (works with modern browsers)
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;

    const step = cardWidth + gap;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="eid-wrap">
      <div className="eid-top">
        <div className="eid-heading">
          <h2 className="eid-title">EID COLLECTIONS</h2>
          <div className="eid-underline" />
        </div>

        <button className="eid-seeMore" type="button">
          See More <span className="eid-seeMoreArrow">›</span>
        </button>
      </div>

      {/* Hover area for nav show/hide */}
      <div
        className={`eid-row ${showNav ? "eid-row-hover" : ""}`}
        onMouseEnter={() => setShowNav(true)}
        onMouseLeave={() => setShowNav(false)}
      >
        {/* Left arrow (show only on hover) */}
        <button
          className={`eid-nav eid-nav-left ${showNav ? "eid-nav-show" : ""}`}
          type="button"
          aria-label="previous"
          onClick={() => scrollOne(-1)}
        >
          ‹
        </button>

        <div className="eid-track" ref={trackRef}>
          {/* Featured (big) card */}
          {featured && (
            <article className="eid-card eid-card-featured">
              <div className="eid-media">
                <div className="eid-mediaTop">
                  <BrandMark brand={featured.brand} />
                  <span className="eid-badge">{featured.discountText}</span>
                </div>

                <div className="eid-imageWrap">
                  <img
                    src={featured.img}
                    alt={featured.title}
                    className="eid-img"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              </div>

              <div className="eid-content">
                <div className="eid-sizes">
                  {["39", "40", "41", "42", "43"].map((s) => (
                    <button key={s} className="eid-size" type="button">
                      {s}
                    </button>
                  ))}
                </div>

                <div className="eid-colors" aria-label="colors">
                  <span className="eid-dot eid-dot-brown" />
                  <span className="eid-dot eid-dot-black" />
                </div>

                <h3 className="eid-name">{featured.title}</h3>

                <div className="eid-priceRow">
                  <span className="eid-price">{formatBDT(featured.price)}</span>
                  <span className="eid-old">{formatBDT(featured.oldPrice)}</span>
                </div>

                <button className="eid-order" type="button">
                  <span className="eid-bolt">⚡</span> ORDER NOW
                </button>
              </div>
            </article>
          )}

          {/* Rest cards */}
          {rest.map((p) => (
            <article key={p.id} className="eid-card eid-card-compact">
              <div className="eid-media eid-media-compact">
                <div className="eid-mediaTop">
                  <BrandMark brand={p.brand} />
                  <span className="eid-badge">{p.discountText}</span>
                </div>

                <div className="eid-imageWrap eid-imageWrap-compact">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="eid-img"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              </div>

              <div className="eid-content eid-content-compact">
                {p.code ? (
                  <div className="eid-code">{p.code}</div>
                ) : (
                  <div className="eid-code eid-code-empty">.</div>
                )}

                <h3 className="eid-name eid-name-compact">{p.title}</h3>

                <div className="eid-priceRow eid-priceRow-compact">
                  <span className="eid-price">{formatBDT(p.price)}</span>
                  <span className="eid-old">{formatBDT(p.oldPrice)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Right arrow (show only on hover) */}
        <button
          className={`eid-nav eid-nav-right ${showNav ? "eid-nav-show" : ""}`}
          type="button"
          aria-label="next"
          onClick={() => scrollOne(1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
