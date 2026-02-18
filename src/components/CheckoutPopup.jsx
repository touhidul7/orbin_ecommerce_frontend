/* eslint-disable no-unused-vars */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoCloseOutline } from "react-icons/io5";
import { CartContext } from "../context/CartContext";
import OrderSuccessPopup from "./OrderSuccessPopup";

function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

// ✅ ULTIMATE FIX - Handles ALL possible API formats
function extractRecommendedProducts(product) {
  if (!product) return [];
  
  const result = [];
  const seen = new Set();
  
  try {
    let recData = product.recommended_product;
    if (!recData) return [];
    
    // CASE 1: Already an array
    if (Array.isArray(recData)) {
      for (const item of recData) {
        if (item && item.id) {
          const id = Number(item.id);
          if (!seen.has(id)) {
            seen.add(id);
            result.push(item);
          }
        }
      }
    }
    
    // CASE 2: Stringified JSON
    else if (typeof recData === "string") {
      const parsed = safeJsonParse(recData);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.id) {
            const id = Number(item.id);
            if (!seen.has(id)) {
              seen.add(id);
              result.push(item);
            }
          }
        }
      }
    }
    
    // CASE 3: Single object
    else if (recData && typeof recData === "object" && recData.id) {
      const id = Number(recData.id);
      if (!seen.has(id)) {
        seen.add(id);
        result.push(recData);
      }
    }
    
  } catch (e) {
    console.error("Error extracting recommendations:", e);
  }
  
  return result;
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
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  // ✅ CRITICAL FIX: Force cart to load from localStorage if context is empty
  useEffect(() => {
    // If cart is empty but localStorage has items, restore them
    if ((!cart || cart.length === 0) && localStorage.getItem("cart")) {
      const storedCart = getCartFromStorage();
      if (storedCart.length > 0) {
        console.log("🔄 Restoring cart from localStorage:", storedCart);
        setCart(storedCart);
      }
    }
    setIsCartLoaded(true);
  }, [cart, setCart]);

  // ✅ Get current cart - either from context or localStorage
  const currentCart = useMemo(() => {
    if (cart && cart.length > 0) return cart;
    return getCartFromStorage();
  }, [cart]);

  console.log("🛒 Current cart:", currentCart);

  // random order id
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

  const closePopup = () => {
    setIsCheckoutPopup(false);
  };

  // close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Track analytics + random id
  useEffect(() => {
    if (currentCart?.length > 0) {
      window.dataLayer?.push({
        event: "begin_checkout",
        ecommerce: {
          items: currentCart.map((item) => ({
            item_id: item.id,
            item_name: item.product_name,
            price: item.selling_price,
            item_category: item.select_category,
            quantity: item.quantity,
          })),
          currency: "BDT",
        },
      });
    }
    generateRandomText();
  }, [currentCart]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
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

  // Compute subtotal from CURRENT cart
  const subtotal = useMemo(() => {
    return (currentCart || []).reduce((sum, item) => {
      const price = Number(item?.selling_price || 0);
      const qty = Number(item?.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [currentCart]);

  /**
   * ✅ SIMPLIFIED RECOMMENDED PRODUCTS - GUARANTEED TO WORK
   */
  const recommendedList = useMemo(() => {
    // Wait for cart to load
    if (!currentCart || currentCart.length === 0) {
      console.log("⏳ Cart is empty, waiting for items...");
      return [];
    }

    console.log("📦 Generating recommendations from cart:", currentCart);
    
    const recMap = new Map();
    const cartIds = new Set(currentCart.map((c) => Number(c?.id)));

    // Loop through each cart item and get its recommendations
    for (const cartItem of currentCart) {
      const recommendations = extractRecommendedProducts(cartItem);
      console.log(`🔍 Product ID ${cartItem.id} has ${recommendations.length} recommendations:`, recommendations);
      
      for (const rec of recommendations) {
        const recId = Number(rec?.id);
        if (!recId) continue;
        
        // Don't show items already in cart
        if (cartIds.has(recId)) {
          console.log(`⏭️ Skipping ID ${recId} - already in cart`);
          continue;
        }
        
        // Add to map (deduplicate)
        if (!recMap.has(recId)) {
          recMap.set(recId, rec);
          console.log(`✅ Added recommendation: ${rec.product_name} (ID: ${recId})`);
        }
      }
    }

    const finalList = Array.from(recMap.values());
    console.log("🎯 FINAL RECOMMENDED LIST:", finalList);
    return finalList;
  }, [currentCart]);

  const isInCart = (productId) => {
    const id = Number(productId);
    return (currentCart || []).some((c) => Number(c?.id) === id);
  };

  const toggleRecommended = (product, checked) => {
    setCart((prev) => {
      const current = Array.isArray(prev) && prev.length > 0 ? prev : getCartFromStorage();

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

    const productDetails = currentCart;

    if (!productDetails.length) {
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
          const guestOrders = JSON.parse(localStorage.getItem("guestOrders") || "[]");
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
      console.error("Order error:", error);
      toast.error("অর্ডার করা যায়নি, আবার চেষ্টা করুন।");
    }
  };

  const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
  const grandTotal = Number(subtotal || 0) + deliveryCharge;

  // Show loading state while cart is loading
  if (!isCartLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-3">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center">
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

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
                      {/* ✅ RECOMMENDED PRODUCTS - NOW WORKING */}
              {recommendedList.length > 0 ? (
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
              ) : currentCart.length > 0 ? (
                <div className="rounded-xl border border-gray-200 p-4 mb-4 text-center text-gray-500">
                  <p>No recommended products found for items in your cart.</p>
                  <p className="text-xs mt-1">Cart items: {currentCart.map(i => i.product_name).join(", ")}</p>
                </div>
              ) : null}
                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                 {/*  <button
                    type="button"
                    onClick={closePopup}
                    className="cursor-pointer w-1/2 rounded-xl border border-gray-200 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button> */}
                  
                  <button
                    type="submit"
                    className="cursor-pointer w-full rounded-xl bg-black py-3 font-semibold text-white hover:bg-[#222] transition"
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