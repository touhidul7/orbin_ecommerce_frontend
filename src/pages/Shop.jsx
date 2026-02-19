import React, { useEffect, useMemo, useState } from "react";
import ProductSection from "../components/ProductSection";

const Shop = () => {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ website colors
  const COLORS = {
    brandRed: "#BA0001",
    accentYellow: "rgb(249, 216, 219)",
    headerBg: "#053A47",
  };

  // ---------------------------
  // Fetch all products
  // ---------------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products`);
      const result = await res.json();
      setRaw(result);
    } catch (e) {
      console.error("Error fetching data:", e);
      setRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Products array (your API sometimes returns [array])
  const products = useMemo(() => {
    if (Array.isArray(raw?.[0])) return raw[0];
    if (Array.isArray(raw)) return raw;
    return [];
  }, [raw]);

  // ---------------------------
  // Price bounds from products
  // ---------------------------
  const priceBounds = useMemo(() => {
    const prices = products
      .map((p) => Number(p?.selling_price || p?.regular_price || 0))
      .filter((n) => Number.isFinite(n) && n > 0);

    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 10000;

    return { min, max };
  }, [products]);

  // ---------------------------
  // REALTIME filter state
  // ---------------------------
  const [sortBy, setSortBy] = useState(""); // "", "price_low", "price_high", "discount"
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  // init after bounds load
  useEffect(() => {
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  const discountPercent = (regular, selling) => {
    const r = Number(regular || 0);
    const s = Number(selling || 0);
    if (!r || !s || s >= r) return 0;
    return ((r - s) / r) * 100;
  };

  // ✅ REALTIME filtered list
  const filtered = useMemo(() => {
    const low = Math.min(minPrice, maxPrice);
    const high = Math.max(minPrice, maxPrice);

    let list = [...products];

    // price filter
    list = list.filter((p) => {
      const price = Number(p?.selling_price || p?.regular_price || 0);
      if (!Number.isFinite(price)) return false;
      return price >= low && price <= high;
    });

    // sort
    if (sortBy === "price_low") {
      list.sort(
        (a, b) =>
          Number(a?.selling_price || a?.regular_price || 0) -
          Number(b?.selling_price || b?.regular_price || 0)
      );
    } else if (sortBy === "price_high") {
      list.sort(
        (a, b) =>
          Number(b?.selling_price || b?.regular_price || 0) -
          Number(a?.selling_price || a?.regular_price || 0)
      );
    } else if (sortBy === "discount") {
      list.sort(
        (a, b) =>
          discountPercent(b?.regular_price, b?.selling_price) -
          discountPercent(a?.regular_price, a?.selling_price)
      );
    }

    return list;
  }, [products, minPrice, maxPrice, sortBy]);

  const clearAll = () => {
    setSortBy("");
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  };

  const minLimit = priceBounds.min;
  const maxLimit = priceBounds.max;

  return (
    <div>
      {/* header */}
      <div className="text-center p-10 py-10" style={{ backgroundColor: COLORS.brandRed }}>
        <h1 className="font-bold text-4xl mb-1 text-white">SHOP</h1>
      </div>

      <div className="mt-10 lg:mt-14 px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* ---------------- FILTER SIDEBAR ---------------- */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-xl grid place-items-center border"
                  style={{
                    backgroundColor: "#f9d8db",
                    borderColor: COLORS.accentYellow,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"
                      stroke="#DF263A"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="text-lg font-bold text-gray-900">Filters</div>
              </div>

              {/* Sort */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-gray-800">Sort By</label>
                <div className="mt-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)} // ✅ realtime
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Default</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="discount">Discount: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-gray-800">Price Range (৳)</label>

                <div className="mt-4 space-y-3">
                  {/* Min slider */}
                  <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))} // ✅ realtime
                    className="w-full accent-[#DF263A]"
                  />

                  {/* Max slider */}
                  <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))} // ✅ realtime
                    className="w-full accent-[#DF263A] -mt-2"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">to</span>

                  <div className="flex gap-2">
                    <span
                      className="rounded-lg px-3 py-2 text-sm font-bold border"
                      style={{
                        backgroundColor: "rgb(247 227 229)",
                        borderColor: COLORS.accentYellow,
                      }}
                    >
                      ৳{Math.min(minPrice, maxPrice)}
                    </span>

                    <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold border border-gray-200">
                      ৳{Math.max(minPrice, maxPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* buttons */}
              <div className="mt-6 space-y-3">
                {/* ✅ no apply button */}

                <button
                  onClick={clearAll}
                  className="w-full rounded-xl border border-gray-200 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
                products
              </div>
            </div>
          </aside>

          {/* ---------------- PRODUCTS ---------------- */}
          <main>
            <ProductSection loading={loading} data={filtered} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
