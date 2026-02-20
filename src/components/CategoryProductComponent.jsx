/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import Loader from "./Loader";
import { Link, useOutletContext } from "react-router-dom";

const CategoryProductComponent = ({ loading, data = [], className = "" }) => {
  const { isCartOpen, setIsCartOpen } = useOutletContext();
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  const { orderNow, cart } = useContext(CartContext);

  const [cartItems, setCartItems] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState({}); // { [productId:number]: colorName }
  const [selectedSizes, setSelectedSizes] = useState({});   // { [productId:number]: size }
  const [quantities, setQuantities] = useState({});

  // ✅ Filters
  const [sortBy, setSortBy] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [offerFilters, setOfferFilters] = useState({
    bestPrice: false,
    hotDeals: false,
    hotOffers: false,
    newArrival: false,
    trending: false,
  });

  /* ---------- helpers ---------- */
  const getColorCode = (colorName) => {
    const colorMap = {
      yellow: "#FFFF00",
      blue: "#0000FF",
      gray: "#808080",
      red: "#FF0000",
      green: "#008000",
      black: "#000000",
      white: "#FFFFFF",
      orange: "#FFA500",
      purple: "#800080",
      pink: "#FFC0CB",
      brown: "#A52A2A",
      chocolate: "#7B3F00",
      master: "#DE7E01",
    };
    const normalizedColor = colorName?.toLowerCase().trim();
    return colorMap[normalizedColor] || "#CCCCCC";
  };

  const processProductColors = (product) => {
    if (!product?.color) return [];
    return product.color
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean)
      .map((name) => ({ name, code: getColorCode(name) }));
  };

  const getDefaultSize = (item) => {
    const sizes = (item?.size || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return sizes[0] || null;
  };

  const formatUrl = (str) => {
    if (!str) return "product";
    return str
      .toString()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "")
      .toLowerCase();
  };

  const buildImg = (item) => {
    return item?.product_image
      ? `${IMAGE_URL}/admin/product/${item.product_image}`
      : "https://adaptcommunitynetwork.org/wp-content/uploads/2022/01/ef3-placeholder-image.jpg";
  };

  const calcDiscount = (regularPrice, sellingPrice) => {
    const r = Number(regularPrice || 0);
    const s = Number(sellingPrice || 0);
    if (!r || !s || s >= r) return 0;
    return Math.round(((r - s) / r) * 100);
  };

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  //  Handel For Size Selection
  const handleSizeSelect = (productId, size) => {
    const pid = Number(productId);
    setSelectedSizes((prev) => ({
      ...prev,
      [pid]: (size || "").trim(),
    }));
  };

  const handleColorSelect = (productId, colorName) => {
    const pid = Number(productId);
    setSelectedColors((prev) => ({
      ...prev,
      [pid]: (colorName || "").trim(),
    }));
  };

  /* ---------- init selected colors + sizes + qty + price range ---------- */
  useEffect(() => {
    if (!data?.length) return;

    const initialColors = {};
    const initialSizes = {};
    const initialQuantities = {};

    const prices = data.map((p) => num(p.selling_price || p.regular_price));
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);

    data.forEach((item) => {
      const pid = Number(item.id);

      // ✅ default first color (store NAME)
      const colors = processProductColors(item);
      if (colors.length > 0) initialColors[pid] = colors[0].name;

      // ✅ default first size
      const firstSize = getDefaultSize(item);
      if (firstSize) initialSizes[pid] = firstSize;

      // ✅ default qty
      initialQuantities[pid] = 1;
    });

    setSelectedColors(initialColors);
    setSelectedSizes(initialSizes);
    setQuantities(initialQuantities);

    setPriceMin(Number.isFinite(minP) ? minP : 0);
    setPriceMax(Number.isFinite(maxP) ? maxP : 0);
  }, [data]);

  /* ---------- sync cart ---------- */
  useEffect(() => {
    const ids = new Set((cart || []).map((item) => Number(item.id)));
    setCartItems(ids);

    const newQuantities = {};
    (cart || []).forEach((item) => {
      newQuantities[Number(item.id)] = item.quantity;
    });
    setQuantities((prev) => ({ ...prev, ...newQuantities }));
  }, [cart]);

  const toggleOffer = (key) => {
    setOfferFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ Filter + Sort products
  const filteredProducts = useMemo(() => {
    let list = [...(data || [])];

    // Price range filter
    list = list.filter((p) => {
      const price = num(p.selling_price || p.regular_price);
      return price >= priceMin && price <= priceMax;
    });

    // Offers filter (simple logic using "type" field)
    const enabledOffers = Object.entries(offerFilters).filter(([, v]) => v);
    if (enabledOffers.length > 0) {
      list = list.filter((p) => {
        const t = (p.type || "").toLowerCase();
        return (
          (!offerFilters.bestPrice || t.includes("best")) &&
          (!offerFilters.hotDeals || t.includes("deal")) &&
          (!offerFilters.hotOffers || t.includes("offer")) &&
          (!offerFilters.newArrival || t.includes("new")) &&
          (!offerFilters.trending || t.includes("trend"))
        );
      });
    }

    // Sorting
    if (sortBy === "price_low") {
      list.sort((a, b) => num(a.selling_price) - num(b.selling_price));
    }
    if (sortBy === "price_high") {
      list.sort((a, b) => num(b.selling_price) - num(a.selling_price));
    }
    if (sortBy === "name_az") {
      list.sort((a, b) =>
        (a.product_name || "").localeCompare(b.product_name || "")
      );
    }

    return list;
  }, [data, priceMin, priceMax, sortBy, offerFilters]);

  return (
    <div className={`w-full ${className}`}>
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* ✅ RIGHT PRODUCTS GRID */}
          <section className="lg:col-span-12">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-600">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredProducts.map((item) => {
                  const pid = Number(item.id);

                  const colors = processProductColors(item);
                  const hasColors = colors.length > 0;

                  const discount = calcDiscount(
                    item.regular_price,
                    item.selling_price
                  );

                  const currentSize =
                    selectedSizes[pid] ?? getDefaultSize(item);
                  const currentColorName =
                    selectedColors[pid] ?? colors?.[0]?.name ?? null;

                  return (
                    <div
                      key={pid}
                      className="product-group group bg-white rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* IMAGE */}
                      <div className="relative bg-white">
                        {/* discount */}
                        {discount > 0 && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center justify-center rounded-md bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                              -{discount}%
                            </span>
                          </div>
                        )}

                        <Link to={`/product/${pid}/${formatUrl(item.product_name)}`}>
                          <img
                            className="w-full h-[220px] object-contain bg-white transition-transform duration-300 group-hover:scale-[1.06] rounded-md"
                            src={buildImg(item)}
                            alt={item.product_name}
                            loading="lazy"
                          />
                        </Link>
                      </div>

                      {/* CONTENT */}
                      <div className="px-5 pt-3 pb-5 text-center">
                        {/* sizes */}
                        {item?.size && (
                          <div className="custom-color flex justify-center gap-2 flex-wrap mb-2">
                            {item.size
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .slice(0, 5)
                              .map((size, i) => {
                                const isSelected = currentSize === size;

                                return (
                                  <span
                                    key={i}
                                    onClick={() => handleSizeSelect(pid, size)}
                                    className={`min-w-[40px] px-2 py-1 text-sm font-medium rounded-md border cursor-pointer transition-all
                                      ${
                                        isSelected
                                          ? "bg-yellow-500 text-white border-yellow-500 shadow-sm"
                                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                      }
                                    `}
                                  >
                                    {size.toUpperCase()}
                                  </span>
                                );
                              })}
                          </div>
                        )}

                        {/* colors */}
                        {hasColors && (
                          <div className="custom-color flex justify-center gap-2 mb-3 cursor-pointer">
                            {colors.slice(0, 6).map((color, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleColorSelect(pid, color.name)}
                                className={`rounded px-1 border-2 transition cursor-pointer ${
                                  currentColorName === color.name
                                    ? "border-[#e09304]"
                                    : "border-gray-200"
                                }`}
                                title={color.name}
                              >
                                {color.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* title */}
                        <Link to={`/product/${pid}/${formatUrl(item.product_name)}`}>
                          <h3 className="text-[18px] leading-tight font-medium text-gray-900 mt-1 line-clamp-2">
                            {item.product_name || "No Name Available"}
                          </h3>
                        </Link>

                        {/* price */}
                        <div className="mt-3 flex items-center justify-center gap-3">
                          <span className="text-[20px] font-semibold text-gray-900">
                            Tk {item.selling_price}
                          </span>
                          {Number(item.regular_price) > 0 && (
                            <span className="text-base text-gray-400 line-through">
                              Tk {item.regular_price}
                            </span>
                          )}
                        </div>

                        {/* ORDER NOW */}
                        <button
                          onClick={() =>
                            orderNow(item, currentColorName, currentSize)
                          }
                          className="custom-button mt-5 w-full rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-900 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[1px] cursor-pointer"
                        >
                          ⚡ ORDER NOW
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default CategoryProductComponent;