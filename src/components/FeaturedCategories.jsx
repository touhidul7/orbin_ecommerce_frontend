/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./featured-categories.css";
import { Link } from "react-router-dom";


function BrandMark({ variant = "R" }) {
  return (
    <div className="fc-brand" aria-label="brand mark">
      <span className="fc-brand-mark">R</span>
      {variant !== "R" && <span className="fc-brand-text">{variant}</span>}
    </div>
  );
}

export default function FeaturedCategories() {
  // Base URL Setup
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;
  // category data load
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories data
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/products/categories`);
      const result = await response.json();
      setCategories(result[0] || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCategories()
  }, [])

  console.log(categories);


  return (
    <section className="fc-wrap">
      <header className="fc-header">
        <h2 className="fc-title">FEATURED CATEGORIES</h2>
        <div className="fc-underline" />
      </header>

      <div className="fc-grid">
        {categories?.map((c) => (
          <Link to={`/category/${c.name}`} key={c.name} className="fc-card" type="button">
            <div className="fc-inner">
              <div className="fc-logo">
                {c.logoText ? <BrandMark variant={c.logoText} /> : <BrandMark />}
              </div>

              <div className="fc-imgFrame">
                {/* Replace with your real product images */}
                <img
                  className="fc-img"
                  src={c.category_image ? `${IMAGE_URL}/admin/category/${c.category_image}` : 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'}
                  alt={c.name}
                  onError={(e) => {
                    // fallback if image not found
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>

            <div className="fc-label">{c.name}</div>
          </Link>
        ))}
      </div>

      {/* <button className="fc-showMore" type="button">
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
      </button> */}
    </section>
  );
}
