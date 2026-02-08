import React, { useEffect, useState } from "react";
import ProductSection from "./ProductSection";
import { Link } from "react-router-dom";

const ProductsByClass = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch data
  const loadData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      const result = await response.json();
      setData(result[0]); // Access the array of products from the "0" property
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products by class
  const popularProducts = data.filter(product => product.type === "Popular Products");
  const newArrivalProducts = data.filter(product => product.type === "New Arrival");
  const trandingProducts = data.filter(product => product.type === "Tranding Product");

  return (
    <div>
      <div className="fc-wrap">
        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
          <header className="fc-header">
            <h2 className="fc-title">POPULAR CATEGORIES</h2>
            <div className="fc-underline" />
          </header>
          <Link
            to={"/shop"}
            className="flex items-center text-base font-medium text-gray-900 hover:underline"
          >
            See more products
            <svg
              className="ms-1 h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 12H5m14 0-4 4m4-4-4-4"
              />
            </svg>
          </Link>
        </div>

        <ProductSection loading={loading} data={popularProducts} />
      </div>

      <div style={{marginTop:'40px'}} className="fc-wrap">
        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
          <header className="fc-header">
            <h2 className="fc-title">NEW ARRIAVAL</h2>
            <div className="fc-underline" />
          </header>
          <Link
            to={"/shop"}
            className="flex items-center text-base font-medium text-gray-900 hover:underline"
          >
            See more products
            <svg
              className="ms-1 h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 12H5m14 0-4 4m4-4-4-4"
              />
            </svg>
          </Link>
        </div>

        <ProductSection loading={loading} data={newArrivalProducts} />
      </div>

      <div className="fc-wrap">
        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
          <header className="fc-header">
            <h2 className="fc-title">TRANDING PRODUCT</h2>
            <div className="fc-underline" />
          </header>
          <Link
            to={"/shop"}
            className="flex items-center text-base font-medium text-gray-900 hover:underline"
          >
            See more products
            <svg
              className="ms-1 h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 12H5m14 0-4 4m4-4-4-4"
              />
            </svg>
          </Link>
        </div>

        <ProductSection loading={loading} data={trandingProducts} />
      </div>
    </div>
  );
};

export default ProductsByClass;