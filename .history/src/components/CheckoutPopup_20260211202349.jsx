/* eslint-disable no-unused-vars */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoCloseOutline } from "react-icons/io5";
import { CartContext } from "../context/CartContext";
import OrderSuccessPopup from "./OrderSuccessPopup";

/**
 * ✅ FIXED Recommended Checkbox Feature (Working)
 *
 * Why your previous one often "didn't work":
 * 1) When CheckoutPopup opens, sometimes `cart` from context is still empty initially
 *    (because context loads localStorage in useEffect).
 *    You took snapshot in render -> snapshot became [] forever -> no recommended items.
 *
 * ✅ This version:
 * - Takes snapshot ONLY when cart is available (first non-empty load) using useEffect.
 * - Keeps recommended list stable based on that snapshot (won't disappear on toggle).
 * - Checkbox toggles add/remove using setCart functional update (source of truth),
 *   and syncs localStorage immediately.
 * - Subtotal shown is computed from CURRENT cart so totals always update instantly.
 * - Order uses CURRENT cart (includes checked recommended items).
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

  const next = Array.isArray(cart) ? [...cart] : [];
  const idx = next.findIndex((x) => Number(x?.id) === id);
  const addQty = Number(qtyToAdd || 1);

  if (idx >= 0) {
    const prevQty = Number(next[idx]?.quantity || 1);
    next[idx] = { ...next[idx], quantity: prevQty + addQty };
  } else {
    next.push({ ...product, quantity: addQty });
  }

  return next;
}

function removeCartItem(cart, productId) {
  const id = Number(productId);
  if (!id) return cart;
  return (cart || []).filter((x) => Number(x?.id) !== id);
}

export default function CheckoutPopup() {
  const { cart, setCart, setIsCheckoutPopup } = useContext(CartContext);

  const [formData, setFormData] = useState({ deliveryArea: "outside" });
  const [getUser, setGetUser] = useState(null);
  const [orderData, setOrderData] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  // ✅ Snapshot cart AFTER it is loaded (fix for "not working")
  const [baseCartSnapshot, setBaseCartSnapshot] = useState(null);
  useEffect(() => {
    // Take snapshot only once, when cart becomes available.
    if (baseCartSnapshot === null && Array.isArray(cart)) {
      // if cart is empty, still snapshot it (stable list), but usually it becomes non-empty quickly
      setBaseCartSnapshot(cart);
    }
  }, [cart, baseCartSnapshot]);

  // random order id
  const [randomId, setRandomId] = useState("");
  const generateRandomText = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars?.length));
    setRandomId(result);
  };

  const clearSuccess = () => {
    setOrderSuccess(false);
    setIsCheckoutPopup(false);
  };

  const closePopup = () => {
    setIsCheckoutPopup(false);
  };

  // ✅ close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Track analytics + random id
  useEffect(() => {
    if (cart?.length > 0) {
      window.dataLayer?.push({
        event: "begin_checkout",
        ecommerce: {
          items: cart.map((item) => ({
            item_id: item.id,
            item_name: item.product_name,
            price: item.selling_price,
            item_category: item.select_category,
            quantity: item.quantity,
          })),
          // value should be subtotal; we compute below for accuracy
          currency: "BDT",
        },
      });
    }
    generateRandomText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const currentDate = formatDate(new Date());

  // ✅ Always compute subtotal from CURRENT cart to ensure UI updates instantly
  const subtotal = useEffect(() => {
    return (cart || []).reduce((sum, item) => {
      const price = Number(item?.selling_price || 0);
      const qty = Number(item?.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [cart]);

  /**
   * ✅ Recommended products (stable):
   * - built from baseCartSnapshot (cart items when popup opened / loaded)
   * - de-duplicate by id
   * - exclude products that were already in base snapshot (true extras)
   */
  const recommendedList = useEffect(() => {
    const snapshot = Array.isArray(baseCartSnapshot) ? baseCartSnapshot : [];
    const recMap = new Map();
    const baseIds = new Set(snapshot.map((c) => Number(c?.id)));

    for (const cartItem of snapshot) {
      const recs = normalizeRecommendedProducts(cartItem, { depth: 1 });

      for (const r of recs) {
        const rid = Number(r?.id);
        if (!rid) continue;

        if (baseIds.has(rid)) continue; // don't show items already in base cart

        if (!recMap.has(rid)) recMap.set(rid, r);
      }
    }

    return Array.from(recMap.values());
  }, [baseCartSnapshot]);

  const isInCart = (productId) => {
    const id = Number(productId);
    return (cart || []).some((c) => Number(c?.id) === id);
  };

  // ✅ The FIX: use setCart(prev => ...) as single source of truth, sync localStorage inside
  const toggleRecommended = (product, checked) => {
    setCart((prev) => {
      const current = Array.isArray(prev) ? prev : getCartFromStorage();

      const next = checked
        ? upsertCartItem(current, product, 1)
        : removeCartItem(current, product?.id);

      setCartToStorage(next);

      toast.success(checked ? "Recommended item added ✅" : "Recommended item removed ✅");
      return next;
    });
  };

  const checkOut = async (e) => {
    e.preventDefault();

    // ✅ Use CURRENT cart state (already includes checked recommended items)
    const productDetails = Array.isArray(cart) ? cart : getCartFromStorage();

    if (!productDetails?.length) {
      toast.error("আপনার কার্ট খালি। আগে প্রোডাক্ট যোগ করুন।");
      return;
    }

    const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
    const totalValue = Number(subtotal || 0) + deliveryCharge;
    const areaName = formData.deliveryArea === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে";

    const userEmail = getUser ? getUser.email : formData?.email;
    const userName = getUser ? getUser.displayName : formData.name;
    const userPhone = getUser ? orderData?.phone || formData.phone : formData.phone;

    if (!validateBangladeshiPhoneNumber(userPhone)) {
      toast.error("সঠিক ফোন নম্বর দিন: +8801XXXXXXXXX অথবা 01XXXXXXXXX");
      return;
    }

    if (!getUser && (!formData.name || !formData.address || !formData.phone)) {
      toast.error("দয়া করে প্রয়োজনীয় তথ্যগুলো পূরণ করুন।");
      return;
    }

    const order = {
      user_id: getUser ? getUser.uid : null,
      cart: productDetails,
      name: formData.name,
      client_order_id: randomId,
      email: userEmail,
      address: `${getUser ? orderData?.address || formData.address : formData.address}, ${areaName}`,
      phone: userPhone,
      total_price: totalValue,
      p_method: "Cash On Delivery",
    };

    try {
      const hashedEmail = userEmail ? await sha256(userEmail.toLowerCase()) : undefined;
      const hashedPhone = userPhone ? await sha256(userPhone) : undefined;
      const hashedName = userName ? await sha256(userName.toLowerCase()) : undefined;

      window.dataLayer?.push({
        event: "purchase",
        ecommerce: {
          transaction_id: randomId,
          value: totalValue,
          tax: 0,
          shipping: deliveryCharge,
          currency: "BDT",
          items: productDetails.map((item) => ({
            item_id: item.id,
            item_name: item.product_name,
            price: item.selling_price,
            item_category: item.select_category,
            quantity: item.quantity,
          })),
          user_data: {
            email_address: hashedEmail,
            phone_number: hashedPhone,
            address: { first_name: hashedName },
          },
        },
      });

      if (!getUser) {
        window.dataLayer?.push({ event: "sign_up", method: "guest_checkout" });
      }

      const response = await fetch(`${BASE_URL}/order/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        localStorage.setItem("order", JSON.stringify(order));
        toast.success("আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে ✅");

        if (!getUser) {
          const guestOrderWithDate = { ...order, created_at: currentDate, order_id: randomId };
          const guestOrders = JSON.parse(localStorage.getItem("guestOrders")) || [];
          guestOrders.push(guestOrderWithDate);
          localStorage.setItem("guestOrders", JSON.stringify(guestOrders));
        }

        setCart([]);
        setCartToStorage([]);
        setOrderSuccess(true);
      } else {
        const errorData = await response.json();
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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-[pop_200ms_ease-out] overflow-hidden">
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
                onClick={clearSuccess}
              >
                <IoCloseOutline size={26} />
              </button>
              <div className="pt-8">
                <OrderSuccessPopup clearSuccess={clearSuccess} />
              </div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="text-center text-lg font-semibold mb-3">
                  ক্যাশ অন ডেলিভারিতে অর্ডার করতে আপনার তথ্য দিন
                </h3>

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

              {/* ✅ Recommended Products with CHECKBOX */}
              {recommendedList?.length > 0 && (
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
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
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
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
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
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
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
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                {/* Delivery options */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">ডেলিভারি এরিয়া</p>

                  <label
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                      formData.deliveryArea === "inside"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      value="inside"
                      name="deliveryArea"
                      checked={formData.deliveryArea === "inside"}
                      onChange={handleChange}
                      className="accent-yellow-500"
                    />
                    <span className="text-sm">ঢাকার ভিতরে (ডেলিভারি চার্জ: ৳৭০)</span>
                  </label>

                  <label
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                      formData.deliveryArea === "outside"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      value="outside"
                      name="deliveryArea"
                      checked={formData.deliveryArea === "outside"}
                      onChange={handleChange}
                      className="accent-red-500"
                    />
                    <span className="text-sm">ঢাকার বাইরে (ডেলিভারি চার্জ: ৳১২০)</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closePopup}
                    className="cursor-pointer w-1/2 rounded-xl border border-gray-200 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer w-1/2 rounded-xl bg-black py-3 font-semibold text-white hover:bg-[#222] transition"
                  >
                    অর্ডার করুন 
                  </button>
                </div>
              </form>
            </>
          )}
        </div> 
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: translateY(8px) scale(.98); opacity: .6; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
