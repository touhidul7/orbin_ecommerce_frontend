/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import "./featured-categories.css";
import { Link } from "react-router-dom";

function BrandMark({ variant = "R" }) {
  return (
    <div className="fc-brand" aria-label="brand mark">
      {/* <span className="fc-brand-mark">R</span> */}
      {/* {variant !== "R" && <span className="fc-brand-text">{variant}</span>} */}
    </div>
  );
}

export default function FeaturedCategories() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Show more state
  const DEFAULT_LIMIT = 5;
  const [showAll, setShowAll] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/products/categories`);
      const result = await response.json();
      setCategories(result?.[0] || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ✅ Only show 10 unless showAll
  const visibleCategories = useMemo(() => {
    if (showAll) return categories;
    return categories.slice(0, DEFAULT_LIMIT);
  }, [categories, showAll]);

  // ✅ Show button only if categories > 10
  const showButton = categories.length > DEFAULT_LIMIT;

  return (
    <section className="fc-wrap">
      <header className="fc-header mt-2">
        <h2 className="fc-title">FEATURED CATEGORIES</h2>
        <div className="fc-underline" />
      </header>

      {loading ? (
        <div style={{ padding: 16, textAlign: "center" }}>Loading...</div>
      ) : (
        <div className="fc-grid">
          {visibleCategories.map((c) => (
            <Link to={`/category/${c.name}`} key={c.id || c.name} className="fc-card" type="button">
              <div className="fc-inner">
                <div className="fc-logo">
                  {c.logoText ? <BrandMark variant={c.logoText} /> : <BrandMark />}
                </div>

                <div className="fc-imgFrame">
                  <img
                    src={
                      c.category_image
                        ? `${IMAGE_URL}/admin/category/${c.category_image}`
                        : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                    }
                    alt={c.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                    }}
                  />
                </div>
              </div>

              <div className="fc-label">{c.name}</div>
            </Link>
          ))}
        </div>
      )}

      {/* ✅ Show More / Show Less button */}
      {showButton && (
        <button
          className="fc-showMore"
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
        >
          <span>{showAll ? "Show Less" : "Show More"}</span>

          <svg
            className="fc-arrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{
              transform: showAll ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
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
      )}
    </section>
  );
}
