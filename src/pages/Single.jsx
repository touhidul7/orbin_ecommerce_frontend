/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import RelatedProduct from "../components/RelatedProduct";
import { CartContext } from "../context/CartContext";
import { IoLogoWhatsapp } from "react-icons/io";
import { RiMessengerLine } from "react-icons/ri";
import { FaCartShopping } from "react-icons/fa6";
import toast from "react-hot-toast";
import ProductDisclaimerTrust from "../components/ProductDisclaimerTrust";

/**
 * ✅ Added feature:
 * - "Recommended for you" with CHECKBOXES on this page
 * - If checked -> product added to cart
 * - If unchecked -> product removed from cart
 * - Cart totals etc. update because we update localStorage + CartContext setCart
 *
 * ✅ Recommended source:
 * - Uses current product's `recommended_product` (array / stringified JSON / null)
 * - Dedupe by id
 * - Exclude items already in cart
 */

function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

function normalizeRecommendedProducts(product, options = { depth: 1 }) {
  const { depth } = options;
  const seen = new Set();
  const out = [];

  const pushUnique = (p) => {
    if (!p || typeof p !== "object") return;
    const id = Number(p.id);
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(p);
  };

  const read = (p, d) => {
    if (!p || d < 0) return;

    let rec = p.recommended_product;

    if (typeof rec === "string") rec = safeJsonParse(rec);
    if (!Array.isArray(rec)) return;

    for (const item of rec) {
      const obj = typeof item === "string" ? safeJsonParse(item) : item;
      if (!obj) continue;

      pushUnique(obj);

      // prevent infinite nesting (default 1)
      if (d > 0) read(obj, d - 1);
    }
  };

  read(product, depth);
  return out;
}

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return 0;
  return num;
}

function getCartFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

function setCartToStorage(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function upsertCartItem(cart, product, qtyToAdd = 1) {
  const id = Number(product?.id);
  if (!id) return cart;

  const next = [...cart];
  const idx = next.findIndex((x) => Number(x.id) === id);
  const addQty = Number(qtyToAdd || 1);

  if (idx >= 0) {
    const prevQty = Number(next[idx]?.quantity || 1);
    next[idx] = { ...next[idx], quantity: prevQty + addQty };
  } else {
    // recommended items might not have selectedSize/color; keep null for those fields if your cart supports
    next.push({ ...product, quantity: addQty, selectedColor: null, selectedSize: null });
  }

  return next;
}

function removeCartItem(cart, productId) {
  const id = Number(productId);
  if (!id) return cart;
  return (cart || []).filter((x) => Number(x.id) !== id);
}

const Single = () => {
  const { id } = useParams();
  const { isCartOpen, setIsCartOpen } = useOutletContext();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const [selectedImg, setSelectedImg] = useState(null);

  // ✅ also pull setCart so we can update UI totals everywhere instantly
  const { cart, addToCart, orderNow, setCart } = useContext(CartContext);

  const [selectedSize, setSelectedSize] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  const isInCart = useMemo(() => {
    const pid = Number(data?.id);
    if (!pid) return false;
    return (cart || []).some((item) => Number(item.id) === pid);
  }, [cart, data]);

  /* Track product view when data loads */
  useEffect(() => {
    if (data) {
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
    }
  }, [data]);

  /* Color handling functions */
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

  const colors = data?.color
    ? data.color.split(",").map((color) => ({
        name: color.trim(),
        code: getColorCode(color.trim()),
      }))
    : [];

  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (data?.color) {
      const firstColor = data.color.split(",")[0].trim();
      setSelectedColor({ name: firstColor, code: getColorCode(firstColor) });
    } else {
      setSelectedColor(null);
    }
  }, [data]);

  /* Data loading functions */
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/products/${id}`);
      const result = await response.json();
      setData(result[0]);

      if (result[0]?.select_category) {
        loadRelatedProducts(result[0].select_category, result[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (select_category, currentProductId) => {
    setRelatedLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/products/category/${select_category}`);
      const result = await response.json();
      const filteredProducts = result[0].filter(
        (product) => product.id !== parseInt(currentProductId)
      );
      setRelatedProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setRelatedLoading(false);
    }
  };

  // ✅ Recommended list from CURRENT PRODUCT
  const recommendedList = useMemo(() => {
    if (!data) return [];

    const recs = normalizeRecommendedProducts(data, { depth: 1 });
    const inCartIds = new Set((cart || []).map((c) => Number(c.id)));

    // exclude items already in cart + dedupe already handled in normalize
    return recs.filter((p) => {
      const rid = Number(p?.id);
      if (!rid) return false;
      if (Number(data?.id) === rid) return false;
      return !inCartIds.has(rid);
    });
  }, [data, cart]);

  const isRecChecked = (pid) => {
    const idNum = Number(pid);
    if (!idNum) return false;
    return (cart || []).some((c) => Number(c.id) === idNum);
  };

  const toggleRecommended = (product, checked) => {
    const current = getCartFromStorage();

    let next;
    if (checked) {
      next = upsertCartItem(current, product, 1);
      toast.success("Recommended item added ✅");
    } else {
      next = removeCartItem(current, product?.id);
      toast.success("Recommended item removed ✅");
    }

    setCartToStorage(next);
    setCart?.(next); // ✅ update context state (if provided)
  };

  // Handlers for cart actions
  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor) {
      alert("Please select a color first");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToCart(data, selectedColor?.code, selectedSize || null);
    setIsCartOpen(!isCartOpen);
  };

  const handleOrderNow = () => {
    if (colors.length > 0 && !selectedColor) {
      alert("Please select a color first");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    orderNow(data, selectedColor?.code, selectedSize || null);
  };

  useEffect(() => {
    loadData();
    setSelectedImg(null);
    setSelectedSize(null);
  }, [id]);

  return (
    <>
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      ) : (
        <div>
          <div className="bg-white-100 py-8 mt-10 pt-25">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row -mx-4 align-center">
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

                    {data?.image_gallary?.map((item, i) => (
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

                <div className="md:flex-1 px-4">
                  <p className="text-gray-600 text-sm mb-4">{data.select_category}</p>

                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{data.product_name}</h2>

                  <div className="flex mb-4">
                    <div className="mr-4">
                      <span className="text-gray-800 text-2xl font-semibold">
                        ৳ {data.selling_price}
                      </span>
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
                      {data.p_short_des?.split(",").map((line, index) => (
                        <p key={index} className="mb-1">
                          {line.trim()}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Product Size */}
                  <span className="font-bold text-gray-700">Choose Size:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {data.size?.split(",").map((size, index) => (
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
                        {size.toUpperCase()}
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
                              selectedColor?.code === color.code
                                ? "border-black shadow-md"
                                : "border-gray-300"
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

                  {/* ✅ Recommended for you (Checkbox) */}
                  {recommendedList.length > 0 && (
                    <div className="mt-5 rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-900">Recommended for you</h3>
                        <span className="text-xs text-gray-500">Select to include</span>
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
                                    <span className="text-xs text-gray-500 line-through">
                                      ৳ {reg}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {p.availability || "In Stock"}
                                  </span>
                                </div>

                                <div className="mt-2 text-xs text-gray-500">
                                  {checked ? "Included in your cart ✅" : "Not included"}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
      )}
    </>
  );
};

export default Single;
