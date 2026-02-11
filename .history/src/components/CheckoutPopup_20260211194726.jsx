/* eslint-disable no-unused-vars */
import { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoCloseOutline } from "react-icons/io5";
import { CartContext } from "../context/CartContext";
import OrderSuccessPopup from "./OrderSuccessPopup";

/** ---------- helpers ---------- */
function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
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
  if (!id) return Array.isArray(cart) ? cart : [];

  const next = Array.isArray(cart) ? [...cart] : [];
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
  if (!id) return Array.isArray(cart) ? cart : [];
  return (cart || []).filter((x) => Number(x?.id) !== id);
}

/** ---------- component ---------- */
export default function CheckoutPopup() {
  const { cart, setCart, setIsCheckoutPopup } = useContext(CartContext);

  const [formData, setFormData] = useState({ deliveryArea: "outside" });
  const [getUser, setGetUser] = useState(null);
  const [orderData, setOrderData] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  // ✅ Take a snapshot of cart once (stable base)
  const [baseCartSnapshot, setBaseCartSnapshot] = useState(null);
  useEffect(() => {
    if (baseCartSnapshot === null && Array.isArray(cart)) {
      setBaseCartSnapshot(cart);
    }
  }, [cart, baseCartSnapshot]);

  // ✅ NEW: load FULL product objects for cart items (because cart may not contain recommended_product)
  const [snapshotProducts, setSnapshotProducts] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    const snapshot = Array.isArray(baseCartSnapshot) ? baseCartSnapshot : [];
    if (!snapshot.length) {
      setSnapshotProducts([]);
      return;
    }

    let alive = true;

    const load = async () => {
      setRecLoading(true);
      try {
        // fetch full product details by id
        const results = await Promise.all(
          snapshot.map(async (item) => {
            const pid = Number(item?.id);
            if (!pid) return null;

            try {
              const res = await fetch(`${BASE_URL}/products/${pid}`);
              const data = await res.json();

              // your Single page uses result[0]
              const full = Array.isArray(data) ? data[0] : data;
              return full || null;
            } catch {
              return null;
            }
          })
        );

        if (!alive) return;
        setSnapshotProducts(results.filter(Boolean));
      } finally {
        if (alive) setRecLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [BASE_URL, baseCartSnapshot]);

  // ✅ Recommended list computed from FULL products (works)
  const recommendedList = useMemo(() => {
    const snapshot = Array.isArray(baseCartSnapshot) ? baseCartSnapshot : [];
    const baseIds = new Set(snapshot.map((c) => Number(c?.id)));

    const recMap = new Map();

    for (const fullProduct of snapshotProducts) {
      const recs = normalizeRecommendedProducts(fullProduct, { depth: 1 });

      for (const r of recs) {
        const rid = Number(r?.id);
        if (!rid) continue;

        // don't show items already in cart snapshot
        if (baseIds.has(rid)) continue;

        if (!recMap.has(rid)) recMap.set(rid, r);
      }
    }

    return Array.from(recMap.values());
  }, [baseCartSnapshot, snapshotProducts]);

  const isInCart = (productId) => {
    const id = Number(productId);
    return (cart || []).some((c) => Number(c?.id) === id);
  };

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

  /** ------------ rest of your code (same) ------------ */
  const [randomId, setRandomId] = useState("");
  const generateRandomText = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setRandomId(result);
  };

  const clearSuccess = () => {
    setOrderSuccess(false);
    setIsCheckoutPopup(false);
  };

  const closePopup = () => setIsCheckoutPopup(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
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

  const subtotal = useMemo(() => {
    return (cart || []).reduce((sum, item) => {
      const price = Number(item?.selling_price || 0);
      const qty = Number(item?.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [cart]);

  const checkOut = async (e) => {
    e.preventDefault();
    const productDetails = Array.isArray(cart) ? cart : getCartFromStorage();

    if (!productDetails.length) {
      toast.error("আপনার কার্ট খালি। আগে প্রোডাক্ট যোগ করুন।");
      return;
    }

    const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
    const totalValue = Number(subtotal || 0) + deliveryCharge;

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

    // ... keep your existing checkout POST logic here (unchanged)
    toast.success("Checkout logic here ✅ (keep your existing code)");
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

              {/* ✅ Recommended */}
              {recLoading ? (
                <div className="rounded-xl border border-gray-200 p-4 mb-4 text-sm text-gray-600">
                  Loading recommendations...
                </div>
              ) : recommendedList.length > 0 ? (
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
              ) : null}

              {/* Form */}
              <form onSubmit={checkOut} className="space-y-4">
                {/* keep your existing form */}
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
