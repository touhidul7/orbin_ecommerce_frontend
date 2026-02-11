/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { IoLogoWhatsapp } from "react-icons/io";
import { RiMessengerLine } from "react-icons/ri";
import { FaCartShopping } from "react-icons/fa6";

import RelatedProduct from "../components/RelatedProduct";
import ProductDisclaimerTrust from "../components/ProductDisclaimerTrust";
import { CartContext } from "../context/CartContext";

/* -------------------------------- helpers -------------------------------- */

const COLOR_MAP = {
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

function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Recursively “normalize” recommended_product that may be:
 * - null
 * - array
 * - stringified JSON (even nested stringified JSON inside)
 */
function normalizeRecommendedProducts(product, options = {}) {
  const {
    depth = 1, // how deep to traverse nested recommended products
    parseDepth = 3, // how many times to attempt parsing nested JSON strings
  } = options;

  const seen = new Set();
  const out = [];

  const pushUnique = (p) => {
    if (!p || typeof p !== "object") return;
    const id = Number(p.id);
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(p);
  };

  const deepParseMaybe = (value, max = 3) => {
    let cur = value;
    for (let i = 0; i < max; i++) {
      if (typeof cur !== "string") break;
      const parsed = safeJsonParse(cur);
      if (parsed === null) break;
      cur = parsed;
    }
    return cur;
  };

  const read = (p, d) => {
    if (!p || d < 0) return;

    let rec = deepParseMaybe(p.recommended_product, parseDepth);
    if (!Array.isArray(rec)) return;

    for (const item of rec) {
      const obj = deepParseMaybe(item, parseDepth);
      if (!obj || typeof obj !== "object") continue;

      pushUnique(obj);
      if (d > 0) read(obj, d - 1);
    }
  };

  read(product, depth);
  return out;
}

function formatPrice(n) {
  const num = Number(n);
  return Number.isNaN(num) ? 0 : num;
}

function getColorCode(colorName) {
  const normalized = colorName?.toLowerCase()?.trim();
  return COLOR_MAP[normalized] || "#CCCCCC";
}

function splitCsv(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getCartFromStorage() {
  try {
    const raw = localStorage.getItem("cart");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setCartToStorage(cart) {
  localStorage.setItem("cart", JSON.stringify(Array.isArray(cart) ? cart : []));
}

function upsertCartItem(cart, product, qtyToAdd = 1, selectedColor = null, selectedSize = null) {
  const id = Number(product?.id);
  if (!id) return Array.isArray(cart) ? cart : [];

  const next = [...(Array.isArray(cart) ? cart : [])];
  const idx = next.findIndex((x) => Number(x.id) === id);
  const addQty = Number(qtyToAdd || 1);

  if (idx >= 0) {
    const prevQty = Number(next[idx]?.quantity || 1);
    next[idx] = { ...next[idx], quantity: prevQty + addQty };
  } else {
    next.push({
      ...product,
      quantity: addQty,
      selectedColor,
      selectedSize,
    });
  }

  return next;
}

function removeCartItem(cart, productId) {
  const id = Number(productId);
  if (!id) return Array.isArray(cart) ? cart : [];
  return (Array.isArray(cart) ? cart : []).filter((x) => Number(x.id) !== id);
}

/**
 * Recommended items: auto-pick defaults so checkbox can add instantly.
 * - size: first size from CSV
 * - color: first color from CSV -> map to hex
 */
function getDefaultVariantForProduct(p) {
  const sizes = splitCsv(p?.size);
  const colors = splitCsv(p?.color);

  const defaultSize = sizes.length ? sizes[0] : null;
  const defaultColor = colors.length ? getColorCode(colors[0]) : null;

  return { defaultSize, defaultColor };
}

/* -------------------------------- component ------------------------------- */

const Single = () => {
  const { id } = useParams();
  const { isCartOpen, setIsCartOpen } = useOutletContext();

  const { cart, addToCart, orderNow, setCart } = useContext(CartContext);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const colors = useMemo(() => {
    const list = splitCsv(data?.color);
    return list.map((name) => ({ name, code: getColorCode(name) }));
  }, [data]);

  // set default selectedColor when product changes
  useEffect(() => {
    if (colors.length > 0) setSelectedColor(colors[0]);
    else setSelectedColor(null);
  }, [colors]);

  const isInCart = useMemo(() => {
    const pid = Number(data?.id);
    if (!pid) return false;
    return (cart || []).some((item) => Number(item.id) === pid);
  }, [cart, data]);

  // Track product view when data loads
  useEffect(() => {
    if (!data) return;
    window.dataLayer?.push({
      event: "view_item",
      ecommerce: {
        items: [
          {
            item_id: data.id,
            item_name: data.product_name,
            price: data.selling_price,
            item_category: data.select_category,
            quantity: 1,
          },
        ],
      },
    });
  }, [data]);

  const resolveSingleProduct = (payload) => {
    // Your APIs sometimes return: array, or { "0": [ ... ] }, or { data: ... }
    if (Array.isArray(payload)) return payload[0] || null;
    if (payload && typeof payload === "object") {
      if (Array.isArray(payload?.["0"])) return payload["0"][0] || null;
      if (Array.isArray(payload?.data)) return payload.data[0] || null;
      if (payload?.product) return payload.product;
    }
    return null;
  };

  const resolveCategoryProducts = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object") {
      if (Array.isArray(payload?.["0"])) return payload["0"];
      if (Array.isArray(payload?.data)) return payload.data;
    }
    return [];
  };

  const loadRelatedProducts = useCallback(
    async (select_category, currentProductId) => {
      setRelatedLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/products/category/${select_category}`);
        const payload = await response.json();

        // your server sometimes returns { "0": [ ... ] } or [ ... ]
        const list = resolveCategoryProducts(payload);

        const filtered = list.filter((p) => Number(p.id) !== Number(currentProductId));
        setRelatedProducts(filtered);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setRelatedLoading(false);
      }
    },
    [BASE_URL]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/products/${id}`);
      const payload = await response.json();

      const product = resolveSingleProduct(payload);
      setData(product);

      if (product?.select_category) {
        loadRelatedProducts(product.select_category, product.id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, id, loadRelatedProducts]);

  useEffect(() => {
    loadData();
    setSelectedImg(null);
    setSelectedSize(null);
  }, [id]);

  // ✅ Recommended list (show for every product if exists)
  const recommendedList = useMemo(() => {
    if (!data) return [];
    const list = normalizeRecommendedProducts(data, { depth: 1, parseDepth: 4 });

    // remove self + dedupe handled in normalize
    return list.filter((p) => Number(p?.id) && Number(p?.id) !== Number(data?.id));
  }, [data]);

  const isRecChecked = useCallback(
    (pid) => {
      const idNum = Number(pid);
      if (!idNum) return false;
      return (cart || []).some((c) => Number(c.id) === idNum);
    },
    [cart]
  );

  /**
   * ✅ Checkbox behavior:
   * - checked: add recommended item to cart (auto default size/color)
   * - unchecked: remove recommended item from cart
   * - keep localStorage + CartContext in sync
   */
  const toggleRecommended = useCallback(
    (product, checked) => {
      const pid = Number(product?.id);
      if (!pid) return;

      setCart?.((prev) => {
        const current = Array.isArray(prev) ? prev : getCartFromStorage();
        let next = current;

        if (checked) {
          const { defaultColor, defaultSize } = getDefaultVariantForProduct(product);
          next = upsertCartItem(current, product, 1, defaultColor, defaultSize);
          toast.success("Recommended item added ✅");
        } else {
          next = removeCartItem(current, pid);
          toast.success("Recommended item removed ✅");
        }

        setCartToStorage(next);
        return next;
      });
    },
    [setCart]
  );

  // Handlers for main product cart actions
  const handleAddToCart = useCallback(() => {
    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToCart(data, selectedColor?.code, selectedSize || null);
    setIsCartOpen(!isCartOpen);
  }, [addToCart, colors.length, data, isCartOpen, selectedColor, selectedSize, setIsCartOpen]);

  const handleOrderNow = useCallback(() => {
    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    orderNow(data, selectedColor?.code, selectedSize || null);
  }, [colors.length, data, orderNow, selectedColor, selectedSize]);

  /* ------------------------------- rendering ------------------------------ */

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border border-gray-200 p-6 bg-white">
          <p className="text-gray-700 font-semibold">Product not found.</p>
          <Link to="/" className="text-blue-600 underline mt-2 inline-block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white-100 py-8 mt-10 pt-25">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row -mx-4 align-center">
            {/* LEFT: Images */}
            <div className="md:flex-1 px-4">
              <div className="lg:h-[460px] rounded-lg bg-white mb-4 border border-gray-100 p-2">
                <img
                  className="w-full lg:h-full h-auto object-cover"
                  src={
                    selectedImg
                      ? `${IMAGE_URL}/admin/product/gallery/${selectedImg}`
                      : `${IMAGE_URL}/admin/product/${data.product_image}`
                  }
                  alt={data.product_name}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedImg("")}
                  className="w-1/4 h-auto cursor-pointer hover:shadow-sm"
                >
                  <img
                    src={`${IMAGE_URL}/admin/product/${data.product_image}`}
                    alt="Product view"
                    className="w-full h-full object-cover"
                  />
                </button>

                {Array.isArray(data?.image_gallary) &&
                  data.image_gallary.map((item, i) => (
                    <button
                      onClick={() => setSelectedImg(item)}
                      className="w-1/4 h-auto cursor-pointer hover:shadow-sm"
                      key={i}
                    >
                      <img
                        src={`${IMAGE_URL}/admin/product/gallery/${item}`}
                        alt={`Product view ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            </div>

            {/* RIGHT: Details */}
            <div className="md:flex-1 px-4">
              <p className="text-gray-600 text-sm mb-4">{data.select_category}</p>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">{data.product_name}</h2>

              <div className="flex mb-4">
                <div className="mr-4">
                  <span className="text-gray-800 text-2xl font-semibold">৳ {data.selling_price}</span>
                  {data.regular_price && (
                    <span className="line-through ml-2 text-red-500 text-xl">
                      ৳{data.regular_price}
                    </span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-gray-700 text-xl">Availability: </span>
                  <span className="text-gray-600">{data.availability}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-700">Product Description:</span>
                <div className="text-gray-600 text-sm mt-2">
                  {data.p_short_des
                    ? data.p_short_des.split(",").map((line, index) => (
                        <p key={index} className="mb-1">
                          {line.trim()}
                        </p>
                      ))
                    : null}
                </div>
              </div>

              {/* Product Size */}
              <span className="font-bold text-gray-700">Choose Size:</span>
              <div className="flex gap-2 mt-2 flex-wrap">
                {splitCsv(data.size).map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 border rounded text-sm font-medium transition cursor-pointer
                      ${
                        selectedSize === size
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {String(size).toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Color */}
              {colors.length > 0 && (
                <div className="mt-4">
                  <span className="font-bold text-gray-700">Choose Color:</span>
                  <div className="flex gap-2 mt-2">
                    {colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          selectedColor?.code === color.code ? "border-black shadow-md" : "border-gray-300"
                        } hover:shadow-sm`}
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                        aria-label={`Select color ${color.name}`}
                      />
                    ))}
                  </div>
                  {selectedColor && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {selectedColor.name}</p>
                  )}
                </div>
              )}

              {/* ✅ Recommended for you (Checkbox for EVERY product if it has recommended_product) */}
              {recommendedList.length > 0 && (
                <div className="mt-5 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">Recommended for you</h3>
                    <span className="text-xs text-gray-500">Tick to add to cart</span>
                  </div>

                  <div className="space-y-3">
                    {recommendedList.map((p) => {
                      const sell = formatPrice(p.selling_price);
                      const reg = formatPrice(p.regular_price);
                      const hasDiscount = reg > sell;

                      const checked = isRecChecked(p.id);

                      return (
                        <label
                          key={p.id}
                          className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition cursor-pointer"
                        >
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => toggleRecommended(p, e.target.checked)}
                              className="h-4 w-4 accent-black cursor-pointer"
                            />
                          </div>

                          <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {p.product_image ? (
                              <img
                                src={`${IMAGE_URL}/admin/product/${p.product_image}`}
                                alt={p.product_name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : null}
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 leading-snug">
                              {p.product_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.select_category}
                              {p.select_sub_category ? ` • ${p.select_sub_category}` : ""}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-bold">৳ {sell}</span>
                              {hasDiscount && (
                                <span className="text-xs text-gray-500 line-through">৳ {reg}</span>
                              )}
                              <span className="text-xs text-gray-500">{p.availability || "In Stock"}</span>
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              {checked ? "Added to cart ✅" : "Not added"}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-gray-500 mt-3">
                    Note: recommended items are added with default size/color (first option) if available.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="w-full my-4">
                <button
                  onClick={handleOrderNow}
                  className="w-full bg-[#AD0101] text-white py-3 rounded px-4 font-bold hover:bg-[#f6a503] cursor-pointer flex gap-2 justify-center items-center transition-colors"
                >
                  <FaCartShopping size={25} /> ক্যাশ অন ডেলিভারিতে অর্ডার করুণ
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-full">
                  {isInCart ? (
                    <button className="bg-[black] text-white font-bold py-2 px-4 rounded-md hover:bg-[#313131] hover:text-white transition duration-300 cursor-pointer w-full">
                      <Link to="/cart" className="py-2 h-full px-4 w-full">
                        কার্ট দেখুন
                      </Link>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="bg-[black] text-white font-bold py-2 px-4 rounded-md hover:bg-[#313131] hover:text-white transition duration-300 cursor-pointer w-full"
                    >
                      কার্টে রাখুন
                    </button>
                  )}
                </div>

                <div className="w-full">
                  <button
                    onClick={handleOrderNow}
                    className="bg-[#00A63E] text-white font-bold py-2 px-4 rounded-md hover:bg-[#ffff00] hover:text-black transition duration-300 cursor-pointer w-full"
                  >
                    অর্ডার করুন
                  </button>
                </div>
              </div>

              <div className="w-full flex gap-2">
                <Link
                  target="_blank"
                  to="https://wa.me/+8801851003265"
                  className="w-full bg-[#25D366] text-white py-2 px-4 font-bold hover:bg-[#25d365d0] cursor-pointer flex gap-2 justify-center items-center transition-colors rounded"
                >
                  <IoLogoWhatsapp size={25} /> WhatsApp
                </Link>
                <Link
                  target="_blank"
                  to="https://web.facebook.com/messages/t/116061797769426/"
                  className="w-full bg-[#0863F7] text-white py-2 px-4 font-bold hover:bg-[#0864f7c9] cursor-pointer flex gap-2 justify-center items-center transition-colors rounded"
                >
                  <RiMessengerLine size={25} /> Messenger
                </Link>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <ProductDisclaimerTrust />

          <div className="lg:py-8 rounded border border-slate-200 bg-white p-4 sm:p-5 shadow-sm mt-5">
            <div className="text-2xl font-bold text-gray-800">Description</div>
            <div className="mt-2 text-gray-700">{data.product_description}</div>
          </div>
        </div>
      </div>

      <RelatedProduct products={relatedProducts} loading={relatedLoading} />
    </div>
  );
};

export default Single;
