/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoCloseOutline } from "react-icons/io5";
import { CartContext } from "../context/CartContext";
import OrderSuccessPopup from "./OrderSuccessPopup";

/** ---------------- helpers ---------------- */
function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * ✅ SUPER IMPORTANT:
 * Your stored value can be:
 * - string of array: "[{...}]"
 * - array: [{...}]
 * - object: {...}
 * - { product: ... }
 */
function extractFirstProduct(anyValue) {
  if (!anyValue) return null;

  // if already an object with product key
  if (typeof anyValue === "object" && anyValue.product) {
    return extractFirstProduct(anyValue.product);
  }

  // if it's an array, take first
  if (Array.isArray(anyValue)) {
    return anyValue[0] || null;
  }

  // if it's a string, try parse it (could become array/object)
  if (typeof anyValue === "string") {
    const parsed = safeJsonParse(anyValue);
    if (parsed) return extractFirstProduct(parsed);

    // if parsing fails, nothing we can do
    return null;
  }

  // if plain object product
  if (typeof anyValue === "object" && anyValue.id) {
    return anyValue;
  }

  return null;
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

    // ✅ your case: recommended_product is a string: "[{...}]"
    if (typeof rec === "string") rec = safeJsonParse(rec);

    if (!Array.isArray(rec)) return;

    for (const item of rec) {
      // sometimes item itself is stringified
      const obj = typeof item === "string" ? safeJsonParse(item) : item;
      if (!obj) continue;

      pushUnique(obj);

      // prevent infinite nesting
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
  const safeCart = Array.isArray(cart) ? cart : [];
  if (!id) return safeCart;

  const next = [...safeCart];
  const idx = next.findIndex((x) => Number(x?.id) === id);
  const addQty = Number(qtyToAdd || 1);

  if (idx >= 0) {
    const prevQty = Number(next[idx]?.quantity || 1);
    next[idx] = { ...next[idx], quantity: prevQty + addQty };
  } else {
    next.push({
      ...product,
      quantity: addQty,
      selectedColor: null,
      selectedSize: null,
    });
  }

  return next;
}

function removeCartItem(cart, productId) {
  const id = Number(productId);
  const safeCart = Array.isArray(cart) ? cart : [];
  if (!id) return safeCart;
  return safeCart.filter((x) => Number(x?.id) !== id);
}

/**
 * ✅ Read checkout product from localStorage
 * We try multiple possible keys to be safe.
 * Use the one you store.
 */
function getCheckoutProductFromStorage() {
  const tryKeys = [
    "checkout_current_product", // if you used my suggested key
    "orderNow",                 // common
    "order_now_product",        // common
    "single_product",           // common
    "product",                  // worst case
  ];

  for (const key of tryKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    // raw might be JSON string of array/object
    const parsed = safeJsonParse(raw);
    const product = extractFirstProduct(parsed ?? raw);
    if (product?.id) return product;
  }

  return null;
}

/** ---------------- component ---------------- */
export default function CheckoutPopup() {
  const { cart, setCart, setIsCheckoutPopup } = useContext(CartContext);

  const [formData, setFormData] = useState({ deliveryArea: "outside" });
  const [getUser, setGetUser] = useState(null);
  const [orderData, setOrderData] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  // ✅ use context cart if available, else fallback storage
  const currentCart = useMemo(() => {
    const ctx = Array.isArray(cart) ? cart : [];
    return ctx.length ? ctx : getCartFromStorage();
  }, [cart]);

  // ✅ checkout product stored when clicking Order Now
  const [checkoutProduct, setCheckoutProduct] = useState(() => getCheckoutProductFromStorage());

  // Re-read when popup mounts (in case stored right before open)
  useEffect(() => {
    setCheckoutProduct(getCheckoutProductFromStorage());
  }, []);

  const closePopup = () => setIsCheckoutPopup(false);

  // close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setGetUser(user?.user || null);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDeliveryCharge = (area) => (area === "inside" ? 70 : 120);

  const validateBangladeshiPhoneNumber = (phone) => {
    const regex = /^(?:\+8801|01)\d{9}$/;
    return regex.test(phone);
  };

  // subtotal from CURRENT cart
  const subtotal = useMemo(() => {
    return (currentCart || []).reduce((sum, item) => {
      const price = Number(item?.selling_price || 0);
      const qty = Number(item?.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [currentCart]);

  /**
   * ✅ Recommended list from checkoutProduct
   * IMPORTANT: do NOT filter out "already in cart", or it disappears after check.
   * We ONLY remove current product itself.
   */
  const recommendedList = useMemo(() => {
    if (!checkoutProduct) return [];

    const recs = normalizeRecommendedProducts(checkoutProduct, { depth: 1 });

    return recs.filter((p) => {
      const rid = Number(p?.id);
      if (!rid) return false;
      if (Number(checkoutProduct?.id) === rid) return false;
      return true;
    });
  }, [checkoutProduct]);

  const isInCart = (pid) => {
    const idNum = Number(pid);
    if (!idNum) return false;
    return (currentCart || []).some((c) => Number(c?.id) === idNum);
  };

  const toggleRecommended = (product, checked) => {
    // ✅ stable source: localStorage cart
    const current = getCartFromStorage();

    const next = checked
      ? upsertCartItem(current, product, 1)
      : removeCartItem(current, product?.id);

    setCartToStorage(next);
    setCart?.(next);

    toast.success(checked ? "Recommended item added ✅" : "Recommended item removed ✅");
  };

  const checkOut = async (e) => {
    e.preventDefault();

    const productDetails = getCartFromStorage();
    if (!productDetails.length) {
      toast.error("আপনার কার্ট খালি। আগে প্রোডাক্ট যোগ করুন।");
      return;
    }

    const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
    const totalValue = Number(subtotal || 0) + deliveryCharge;
    const areaName = formData.deliveryArea === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে";

    const userEmail = getUser ? getUser.email : formData?.email;
    const userPhone = getUser ? orderData?.phone || formData.phone : formData.phone;

    if (!validateBangladeshiPhoneNumber(userPhone)) {
      toast.error("সঠিক ফোন নম্বর দিন: +8801XXXXXXXXX অথবা 01XXXXXXXXX");
      return;
    }

    if (!getUser && (!formData.name || !formData.address || !formData.phone)) {
      toast.error("দয়া করে প্রয়োজনীয় তথ্যগুলো পূরণ করুন।");
      return;
    }

    // your order payload (unchanged)
    const order = {
      user_id: getUser ? getUser.uid : null,
      cart: productDetails,
      name: formData.name,
      client_order_id: "xxxxx",
      email: userEmail,
      address: `${formData.address}, ${areaName}`,
      phone: userPhone,
      total_price: totalValue,
      p_method: "Cash On Delivery",
    };

    try {
      const response = await fetch(`${BASE_URL}/order/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        toast.success("আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে ✅");
        setCart([]);
        setCartToStorage([]);
        setOrderSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "অর্ডার ব্যর্থ হয়েছে");
      }
    } catch (error) {
      toast.error("অর্ডার করা যায়নি, আবার চেষ্টা করুন।");
    }
  };

  const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
  const grandTotal = Number(subtotal || 0) + deliveryCharge;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-3"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closePopup();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
          <button
            type="button"
            onClick={closePopup}
            className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close"
          >
            <IoCloseOutline size={26} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-auto px-5 py-4">
          {orderSuccess ? (
            <div className="relative">
              <button
                className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 transition"
                type="button"
                onClick={() => {
                  setOrderSuccess(false);
                  setIsCheckoutPopup(false);
                }}
              >
                <IoCloseOutline size={26} />
              </button>
              <div className="pt-8">
                <OrderSuccessPopup clearSuccess={() => setIsCheckoutPopup(false)} />
              </div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="rounded-xl border border-gray-200 p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">সাবটোটাল</span>
                    <span className="font-medium">৳ {subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      ডেলিভারি চার্জ ({formData.deliveryArea === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"})
                    </span>
                    <span className="font-medium">৳ {deliveryCharge}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">মোট</span>
                    <span className="font-semibold">৳ {grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* ✅ Recommended */}
              {recommendedList.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">Recommended for you</h3>
                    <span className="text-xs text-gray-500">Tick to include</span>
                  </div>

                  <div className="space-y-3">
                    {recommendedList.map((p) => {
                      const sell = formatPrice(p.selling_price);
                      const reg = formatPrice(p.regular_price);
                      const hasDiscount = reg > sell;
                      const checked = isInCart(p.id);

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
                              <span className="text-xs text-gray-500">
                                {p.availability || "In Stock"}
                              </span>
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              {checked ? "Included ✅" : "Not included"}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={checkOut} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">আপনার নাম *</label>
                    <input
                      name="name"
                      onChange={handleChange}
                      value={formData.name || ""}
                      type="text"
                      placeholder="আপনার নাম"
                      required
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">ফোন নাম্বার *</label>
                    <input
                      name="phone"
                      onChange={handleChange}
                      value={formData.phone || ""}
                      type="text"
                      placeholder="01XXXXXXXXX"
                      required
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">সম্পূর্ণ ঠিকানা *</label>
                    <input
                      name="address"
                      onChange={handleChange}
                      value={formData.address || ""}
                      type="text"
                      placeholder="বাসা/রোড/এলাকা"
                      required
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">আপনার ইমেইল</label>
                    <input
                      name="email"
                      onChange={handleChange}
                      value={getUser?.email || formData.email || ""}
                      type="email"
                      placeholder="name@gmail.com"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">ডেলিভারি এরিয়া</p>

                  <label className="flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      value="inside"
                      name="deliveryArea"
                      checked={formData.deliveryArea === "inside"}
                      onChange={handleChange}
                    />
                    <span className="text-sm">ঢাকার ভিতরে (ডেলিভারি চার্জ: ৳৭০)</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      value="outside"
                      name="deliveryArea"
                      checked={formData.deliveryArea === "outside"}
                      onChange={handleChange}
                    />
                    <span className="text-sm">ঢাকার বাইরে (ডেলিভারি চার্জ: ৳১২০)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closePopup}
                    className="cursor-pointer w-1/2 rounded-xl border border-gray-200 py-3 font-semibold text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer w-1/2 rounded-xl bg-black py-3 font-semibold text-white"
                  >
                    অর্ডার করুন
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
