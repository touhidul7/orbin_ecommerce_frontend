/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import Loader from "./Loader";
import { Link, useOutletContext } from "react-router-dom";

const CategoryProductComponent = ({ loading, data = [], className = "" }) => {
    const { isCartOpen, setIsCartOpen } = useOutletContext();
    const [selectedSizes, setSelectedSizes] = useState({});
    const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

    //  Handel For Size Selection
    const handleSizeSelect = (productId, size) => {
        setSelectedSizes((prev) => ({
            ...prev,
            [productId]: size,
        }));
    };


    const { orderNow, cart } = useContext(CartContext);

    const [cartItems, setCartItems] = useState(new Set());
    const [selectedColors, setSelectedColors] = useState({});
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
        };
        const normalizedColor = colorName?.toLowerCase().trim();
        return colorMap[normalizedColor] || "#CCCCCC";
    };

    const processProductColors = (product) => {
        if (!product?.color) return [];
        return product.color.split(",").map((color) => ({
            name: color.trim(),
            code: getColorCode(color.trim()),
        }));
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

    /* ---------- init selected colors + qty + price range ---------- */
    useEffect(() => {
        if (!data?.length) return;

        const initialColors = {};
        const initialQuantities = {};

        const prices = data.map((p) => num(p.selling_price || p.regular_price));
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);

        data.forEach((item) => {
            const colors = processProductColors(item);
            if (colors.length > 0) initialColors[item.id] = colors[0].code;
            initialQuantities[item.id] = 1;
        });

        setSelectedColors(initialColors);
        setQuantities(initialQuantities);

        setPriceMin(Number.isFinite(minP) ? minP : 0);
        setPriceMax(Number.isFinite(maxP) ? maxP : 0);
    }, [data]);

    /* ---------- sync cart ---------- */
    useEffect(() => {
        const ids = new Set(cart.map((item) => item.id));
        setCartItems(ids);

        const newQuantities = {};
        cart.forEach((item) => {
            newQuantities[item.id] = item.quantity;
        });
        setQuantities((prev) => ({ ...prev, ...newQuantities }));
    }, [cart]);

    const handleColorSelect = (productId, colorCode) => {
        setSelectedColors((prev) => ({ ...prev, [productId]: colorCode }));
    };

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
                    {/* ✅ LEFT FILTER SIDEBAR */}
                    {/* <aside className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit sticky top-24">
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#053A47] mb-3">
                Sort By
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-yellow-400 px-4 py-3 outline-none"
              >
                <option value="">Select</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name_az">Name: A-Z</option>
              </select>
            </div>

           
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#053A47] mb-3">
                $ Price Range (৳)
              </h3>

              <div className="relative py-4">
                <input
                  type="range"
                  min={0}
                  max={Math.max(priceMax, 1)}
                  value={priceMin}
                  onChange={(e) =>
                    setPriceMin(Math.min(Number(e.target.value), priceMax))
                  }
                  className="w-full accent-yellow-500"
                />
                <input
                  type="range"
                  min={0}
                  max={Math.max(priceMax, 1)}
                  value={priceMax}
                  onChange={(e) =>
                    setPriceMax(Math.max(Number(e.target.value), priceMin))
                  }
                  className="w-full accent-yellow-500 mt-3"
                />
              </div>

              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md">
                  ৳{priceMin}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md">
                  ৳{priceMax}
                </span>
              </div>
            </div>

            
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-[#053A47] mb-3">
                🏷 Offers
              </h3>

              <div className="space-y-3 text-[#053A47]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFilters.bestPrice}
                    onChange={() => toggleOffer("bestPrice")}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span>Best Price</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFilters.hotDeals}
                    onChange={() => toggleOffer("hotDeals")}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span>Hot Deals</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFilters.hotOffers}
                    onChange={() => toggleOffer("hotOffers")}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span>Hot Offers</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFilters.newArrival}
                    onChange={() => toggleOffer("newArrival")}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFilters.trending}
                    onChange={() => toggleOffer("trending")}
                    className="h-4 w-4 accent-yellow-500"
                  />
                  <span>Trending Products</span>
                </label>
              </div>
            </div>
          </aside> */}

                    {/* ✅ RIGHT PRODUCTS GRID */}
                    <section className="lg:col-span-12">
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-600">
                                No products found
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {filteredProducts.map((item) => {
                                    const colors = processProductColors(item);
                                    const hasColors = colors.length > 0;
                                    const discount = calcDiscount(
                                        item.regular_price,
                                        item.selling_price
                                    );

                                    return (
                                        <div
                                            key={item.id}
                                            className="product-group group bg-white rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden"
                                        >
                                            {/* IMAGE */}
                                            <div className="relative bg-white">
                                                {/* logo */}
                                                <div className="absolute top-3 left-3 z-10">
                                                    {/* <div className="h-8 w-8 rounded-md bg-white/90 grid place-items-center shadow-sm">
                                                        <span className="text-yellow-500 font-bold">R</span>
                                                    </div> */}
                                                </div>

                                                {/* discount */}
                                                {discount > 0 && (
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <span className="inline-flex items-center justify-center rounded-md bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                                                            -{discount}%
                                                        </span>
                                                    </div>
                                                )}

                                                <Link
                                                    to={`/product/${item.id}/${formatUrl(item.product_name)}`}
                                                >
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
                                                                const isSelected = selectedSizes[item.id] === size;

                                                                return (
                                                                    <span
                                                                        key={i}
                                                                        onClick={() => handleSizeSelect(item.id, size)}
                                                                        className={`min-w-[40px] px-2 py-1 text-sm font-medium rounded-md border cursor-pointer transition-all
              ${isSelected
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
                                                                onClick={() =>
                                                                    handleColorSelect(item.id, color.code)
                                                                }
                                                                className={`h-5 w-5 rounded-full border-2 transition cursor-pointer ${selectedColors[item.id] === color.code
                                                                        ? "border-gray-900"
                                                                        : "border-gray-200"
                                                                    }`}
                                                                style={{ backgroundColor: color.code }}
                                                                title={color.name}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {/* title */}
                                                <Link
                                                    to={`/product/${item.id}/${formatUrl(item.product_name)}`}
                                                >
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
                                                    onClick={() => orderNow(item, selectedColors[item.id])}
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
