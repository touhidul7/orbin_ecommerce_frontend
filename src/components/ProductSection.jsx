/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import Loader from "./Loader";
import { Link, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";

const ProductSection = ({ loading, data, className }) => {
  const { isCartOpen, setIsCartOpen } = useOutletContext();
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  const [cartItems, setCartItems] = useState(new Set());
  const { addToCart, orderNow, cart } = useContext(CartContext);

  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({}); // ✅ NEW
  const [quantities, setQuantities] = useState({});

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

  const processProductSizes = (product) => {
    if (!product?.size) return [];
    return product.size
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
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

  /* ---------- init selected colors + sizes + quantity ---------- */
  useEffect(() => {
    if (!Array.isArray(data)) return;

    const initialColors = {};
    const initialSizes = {};
    const initialQuantities = {};

    data.forEach((item) => {
      // default color: first color
      const colors = processProductColors(item);
      if (colors.length > 0) initialColors[item.id] = colors[0].code;

      // default size: null (force user to choose) OR first size
      // If you want auto-select first size, uncomment next line
      // const sizes = processProductSizes(item); if (sizes.length > 0) initialSizes[item.id] = sizes[0];

      initialSizes[item.id] = null;
      initialQuantities[item.id] = 1;
    });

    setSelectedColors(initialColors);
    setSelectedSizes(initialSizes);
    setQuantities(initialQuantities);
  }, [data]);

  /* ---------- sync cart items ---------- */
  useEffect(() => {
    const ids = new Set((cart || []).map((item) => item.id));
    setCartItems(ids);

    const newQuantities = {};
    (cart || []).forEach((item) => {
      newQuantities[item.id] = item.quantity;
    });
    setQuantities((prev) => ({ ...prev, ...newQuantities }));
  }, [cart]);

  const handleColorSelect = (productId, colorCode) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: colorCode }));
  };

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const requireSizeIfNeeded = (item) => {
    const sizes = processProductSizes(item);
    if (sizes.length === 0) return true; // no sizes => ok
    const selected = selectedSizes[item.id];
    if (!selected) {
      toast.error("Please select a size");
      return false;
    }
    return true;
  };

  /* ---------- UI ---------- */
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5 mb-10 ${className || ""}`}
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          {data?.map((item) => {
            const colors = processProductColors(item);
            const sizes = processProductSizes(item);

            const hasColors = colors.length > 0;
            const hasSizes = sizes.length > 0;

            const isInCart = cartItems.has(item.id);
            const discount = calcDiscount(item.regular_price, item.selling_price);

            const selectedSize = selectedSizes[item.id];

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* IMAGE AREA */}
                <div className="relative bg-white">
                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center justify-center rounded-md bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                        -{discount}%
                      </span>
                    </div>
                  )}

                  <Link to={`/product/${item.id}/${formatUrl(item.product_name)}`}>
                    <img
                      className="w-full h-[220px] object-contain bg-white transition-transform duration-300 group-hover:scale-[1.06]"
                      src={buildImg(item)}
                      alt={item.product_name}
                      loading="lazy"
                    />
                  </Link>
                </div>

                {/* CONTENT */}
                <div className="lg:px-5 px-2 pt-3 pb-5 text-center">
                  {/* ✅ Sizes row (CLICKABLE) */}
                  {hasSizes && (
                    <div className="flex justify-center gap-2 flex-wrap mb-2">
                      {sizes.slice(0, 6).map((size, i) => {
                        const active = selectedSize === size;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSizeSelect(item.id, size)}
                            className={`min-w-[36px] rounded-md border px-2 py-1 text-sm font-medium transition cursor-pointer
                              ${
                                active
                                  ? "bg-[#ffc400] text-black border-[#ffc400] shadow-sm"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              }`}
                          >
                            {size.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* colors */}
                  {hasColors && (
                    <div className="flex justify-center gap-2 mb-3">
                      {colors.slice(0, 6).map((color, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleColorSelect(item.id, color.code)}
                          className={`h-5 w-5 rounded-full border-2 transition cursor-pointer ${
                            selectedColors[item.id] === color.code
                              ? "border-[#ffc400]"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color.code }}
                          title={color.name}
                          aria-label={`Select color ${color.name}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <Link to={`/product/${item.id}/${formatUrl(item.product_name)}`}>
                    <h3 className="text-[14px] lg:text-[20px] leading-tight font-medium text-gray-900 mt-1 line-clamp-2">
                      {item.product_name || "No Name Available"}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mt-3 flex-col lg:flex-row flex items-center justify-center gap-3">
                    <span className="text-[16px] lg:text-[22px] font-semibold text-gray-900">
                      Tk {item.selling_price}
                    </span>
                    {Number(item.regular_price) > 0 && (
                      <span className="text-sm lg:text-lg text-gray-400 line-through">
                        Tk {item.regular_price}
                      </span>
                    )}
                  </div>

                  {/* ORDER NOW */}
                  <button
                    onClick={() => {
                      if (!requireSizeIfNeeded(item)) return;
                      orderNow(item, selectedColors[item.id], selectedSizes[item.id] || null);
                    }}
                    className="mt-5 w-full rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-900 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-[1px] cursor-pointer"
                  >
                    ⚡ ORDER NOW
                  </button>

                  {/* Add cart / view cart */}
                  <div className="mt-3">
                    {isInCart ? (
                      <Link
                        to="/cart"
                        className="block w-full rounded-xl bg-black py-3 font-semibold text-white hover:bg-[#313131] transition"
                      >
                        VIEW CART
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (!requireSizeIfNeeded(item)) return;

                          addToCart(
                            item,
                            selectedColors[item.id],
                            selectedSizes[item.id] || null
                          );

                          setIsCartOpen(!isCartOpen);
                        }}
                        className="w-full rounded-xl bg-black py-3 font-semibold text-white hover:bg-[#313131] transition cursor-pointer"
                      >
                        ADD CART
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default ProductSection;
