/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import Loader from "./Loader";
import { Link, useOutletContext } from "react-router-dom";

// ✅ Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ProductSectionSlider = ({ loading, data = [], className = "" }) => {
    const { isCartOpen, setIsCartOpen } = useOutletContext();
    const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

    const { addToCart, orderNow, cart } = useContext(CartContext);

    const [cartItems, setCartItems] = useState(new Set());
    const [selectedColors, setSelectedColors] = useState({});
    const [selectedSizes, setSelectedSizes] = useState({});

    const [quantities, setQuantities] = useState({});

    //   Size Handler
    const handleSizeSelect = (productId, size) => {
        setSelectedSizes((prev) => ({
            ...prev,
            [productId]: size,
        }));
    };


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

    /* ---------- init selected colors + qty ---------- */
    useEffect(() => {
    if (!data?.length) return;

    const initialColors = {};
    const initialSizes = {};
    const initialQuantities = {};

    data.forEach((item) => {
        const colors = processProductColors(item);
        if (colors.length > 0) {
            initialColors[item.id] = colors[0].code;
        }

        // ✅ Select first size automatically
        if (item?.size) {
            const sizes = item.size
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            if (sizes.length > 0) {
                initialSizes[item.id] = sizes[0];
            }
        }

        initialQuantities[item.id] = 1;
    });

    setSelectedColors(initialColors);
    setSelectedSizes(initialSizes); // ✅ ADD THIS
    setQuantities(initialQuantities);
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

    return (
        <div className={`w-full ${className}`}>
            {loading ? (
                <Loader />
            ) : (
                <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={18}
                    slidesPerView={1}
                    breakpoints={{
                        0: {slidesPerView: 2},
                        600: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                        1280: { slidesPerView: 5 },
                    }}
                    className="product-swiper"
                >
                    {data?.map((item) => {
                        const colors = processProductColors(item);
                        const hasColors = colors.length > 0;
                        const isInCart = cartItems.has(item.id);
                        const discount = calcDiscount(item.regular_price, item.selling_price);

                        return (
                            <SwiperSlide key={item.id}>
                                {/* ✅ CARD */}
                                <div className="product-group group bg-white rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden mb-10">
                                    {/* IMAGE AREA */}
                                    <div className="relative bg-white">
                                        {/* top-left logo */}
                                        <div className="absolute top-3 left-3 z-10">
                                            {/* <div className="h-8 w-8 rounded-md bg-white/90 grid place-items-center shadow-sm">
                                                <span className="text-yellow-500 font-bold">R</span>
                                            </div> */}
                                        </div>

                                        {/* top-right discount */}
                                        {discount > 0 && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className="inline-flex items-center justify-center rounded-md bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                                                    -{discount}%
                                                </span>
                                            </div>
                                        )}

                                        <Link to={`/product/${item.id}/${formatUrl(item.product_name)}`}>
                                            <img
                                                className="w-full h-[220px] object-contain bg-white transition-transform duration-300 group-hover:scale-[1.06] rounded-md"
                                                src={buildImg(item)}
                                                alt={item.product_name}
                                                loading="lazy"
                                            />
                                        </Link>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="lg:px-5 px-2 pt-3 pb-5 text-center">
                                        {/* sizes like screenshot */}
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
                                                        onClick={() => handleColorSelect(item.id, color.code)}
                                                        className={`h-5 w-5 rounded-full border-2 transition cursor-pointer ${selectedColors[item.id] === color.code
                                                                ? "border-[#e09304]"
                                                                : "border-gray-200"
                                                            }`}
                                                        style={{ backgroundColor: color.code }}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* title */}
                                        <Link to={`/product/${item.id}/${formatUrl(item.product_name)}`}>
                                            <h3 className="text-[14px] lg:text-[20px] leading-tight font-medium text-gray-900 mt-1 line-clamp-2">
                                                {item.product_name || "No Name Available"}
                                            </h3>
                                        </Link>

                                        {/* price */}
                                        <div className="mt-3  lg:flex-row flex-col flex items-center justify-center gap-2 lg:gap-3">
                                            <span className="text-16px lg:text-[22px] font-semibold text-gray-900">
                                                Tk {item.selling_price}
                                            </span>
                                            {Number(item.regular_price) > 0 && (
                                                <span className="text-sm lg:text-lg text-gray-400 line-through">
                                                    Tk {item.regular_price}
                                                </span>
                                            )}
                                        </div>

                                        {/* ORDER NOW like screenshot */}
                                        <button
                                            onClick={() => orderNow(item, selectedColors[item.id])}
                                            className="custom-button mt-5 w-full rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-900 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-[1px] cursor-pointer"
                                        >
                                            ⚡ ORDER NOW
                                        </button>

                                        {/* optional add cart / view cart */}
                                        {/* <div className="mt-3">
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
                            addToCart(item, selectedColors[item.id]);
                            setIsCartOpen(!isCartOpen);
                          }}
                          className="w-full rounded-xl bg-black py-3 font-semibold text-white hover:bg-[#313131] transition"
                        >
                          ADD CART
                        </button>
                      )}
                    </div> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            )}
        </div>
    );
};

export default ProductSectionSlider;
