// /* eslint-disable no-unused-vars */
// import { useContext, useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import { CartContext } from "../context/CartContext";
// import { IoCloseOutline } from "react-icons/io5";
// import OrderSuccessPopup from "./OrderSuccessPopup";

// export default function CheckoutPopup({ closeModal }) {
//   const { cart, totalPrice, setCart, setIsCheckoutPopup } =
//     useContext(CartContext);
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     deliveryArea: "outside", // Default to outside Dhaka
//   });

//   const [getUser, setGetUser] = useState("");
//   const [orderData, setOrderData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [orderSuccess, setOrderSuccess] = useState(false);
//   const BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   // Generate random order ID
//   const [randomId, setRandomId] = useState("");
//   const generateRandomText = () => {
//     const chars =
//       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let result = "";
//     for (let i = 0; i < 5; i++) {
//       result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     setRandomId(result);
//   };

//   const clearSuccess = () => {
//     setIsCheckoutPopup(false);
//     setOrderSuccess(false);
//   };

//   // Track ViewCart event when component mounts
//   useEffect(() => {
//     if (cart.length > 0) {
//       // Meta Pixel ViewCart
//       // ReactPixel.track('ViewCart', {
//       //   content_ids: cart.map(item => item.id),
//       //   contents: cart.map(item => ({
//       //     id: item.id,
//       //     quantity: item.quantity,
//       //     item_price: item.selling_price
//       //   })),
//       //   content_type: 'product',
//       //   value: totalPrice,
//       //   currency: 'BDT',
//       //   num_items: cart.length
//       // });

//       // Google Analytics view_cart
//       window.dataLayer.push({
//         event: "begin_checkout",
//         ecommerce: {
//           items: cart.map((item) => ({
//             item_id: item.id,
//             item_name: item.product_name,
//             price: item.selling_price,
//             item_category: item.select_category,
//             quantity: item.quantity,
//           })),
//           value: totalPrice,
//           currency: "BDT",
//         },
//       });
//     }
//     generateRandomText();
//   }, []);

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const calculateDeliveryCharge = (area) => {
//     return area === "inside" ? 70 : 120;
//   };

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     setGetUser(user?.user);
//   }, []);

//   const validateBangladeshiPhoneNumber = (phone) => {
//     const regex = /^(?:\+8801|01)\d{9}$/;
//     return regex.test(phone);
//   };

//   // Format date for guest orders
//   const formatDate = (date) => {
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };
//   const currentDate = formatDate(new Date());

//   const checkOut = async (e) => {
//     e.preventDefault();

//     const productDetails = JSON.parse(localStorage.getItem("cart")) || [];
//     const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
//     const totalValue = totalPrice + deliveryCharge;
//     const areaName =
//       formData.deliveryArea === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে";

//     // Get user data (logged in or guest)
//     const userEmail = getUser ? getUser.email : formData?.email;
//     const userName = getUser ? getUser.displayName : formData.name;
//     const userPhone = getUser
//       ? orderData?.phone || formData.phone
//       : formData.phone;

//     const phone = userPhone;

//     if (!validateBangladeshiPhoneNumber(phone)) {
//       toast.error(
//         "Invalid Bangladeshi phone number. Please use the format +8801XXXXXXXXX or 01XXXXXXXXX."
//       );
//       return;
//     }

//     if (!getUser && (!formData.name || !formData.address || !formData.phone)) {
//       toast.error("Please fill out all required fields.");
//       return;
//     }

//     const order = {
//       user_id: getUser ? getUser.uid : null,
//       cart: productDetails,
//       name: formData.name,
//       client_order_id: randomId,
//       email: userEmail,
//       address: `${getUser ? orderData?.address || formData.address : formData.address
//         }, ${areaName}`,
//       phone: phone,
//       total_price: totalValue,
//       p_method: "Cash On Delivery",
//     };

//     try {
//       // Prepare hashed user data
//       const hashedEmail = userEmail
//         ? await sha256(userEmail.toLowerCase())
//         : undefined;
//       const hashedPhone = userPhone ? await sha256(userPhone) : undefined;
//       const hashedName = userName
//         ? await sha256(userName.toLowerCase())
//         : undefined;
//       const hashedUserId = getUser?.uid ? await sha256(getUser.uid) : undefined;

//       // Meta Pixel Purchase with user data
//       // ReactPixel.track('Purchase', {
//       //   value: totalValue,
//       //   currency: 'BDT',
//       //   content_ids: productDetails.map(item => item.id),
//       //   contents: productDetails.map(item => ({
//       //     id: item.id,
//       //     quantity: item.quantity,
//       //     item_price: item.selling_price
//       //   })),
//       //   content_type: 'product',
//       //   order_id: randomId,
//       //   em: hashedEmail,
//       //   ph: hashedPhone,
//       //   fn: hashedName,
//       //   external_id: hashedUserId
//       // });

//       // Google Analytics Purchase with user data
//       window.dataLayer.push({
//         event: "purchase",
//         ecommerce: {
//           transaction_id: randomId,
//           value: totalValue,
//           tax: 0,
//           shipping: deliveryCharge,
//           currency: "BDT",
//           items: productDetails.map((item) => ({
//             item_id: item.id,
//             item_name: item.product_name,
//             price: item.selling_price,
//             item_category: item.select_category,
//             quantity: item.quantity,
//           })),
//           user_data: {
//             email_address: hashedEmail,
//             phone_number: hashedPhone,
//             address: {
//               first_name: hashedName,
//             },
//           },
//         },
//       });

//       // Track CompleteRegistration for guest checkout
//       if (!getUser) {
//         // ReactPixel.track('CompleteRegistration');

//         // Google Analytics for guest registration
//         window.dataLayer.push({
//           event: "sign_up",
//           method: "guest_checkout",
//         });
//       }

//       const response = await fetch(`${BASE_URL}/order/add`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(order),
//       });

//       if (response.ok) {
//         localStorage.setItem("order", JSON.stringify(order));
//         toast.success("Your Order is Placed Successfully");

//         // Save guest order (for non-logged-in users)
//         if (!getUser) {
//           const guestOrderWithDate = {
//             ...order,
//             created_at: currentDate,
//             order_id: randomId,
//           };

//           const guestOrders =
//             JSON.parse(localStorage.getItem("guestOrders")) || [];
//           guestOrders.push(guestOrderWithDate);
//           localStorage.setItem("guestOrders", JSON.stringify(guestOrders));
//         }

//         setCart([]);
//         localStorage.setItem("cart", JSON.stringify([]));

//         // navigate("/order-success");
//         setOrderSuccess(true);
//       } else {
//         const errorData = await response.json();
//         toast.error(errorData.message || "Order placement failed");
//       }
//     } catch (error) {
//       toast.error("Failed to place your order, please try again later.");
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className={`delivery-form ${orderSuccess ? " " : "hidden"}`}>
//         <div className="w-full flex justify-end">
//           <button
//             className="mb-4 cursor-pointer -mr-2 -mt-4"
//             type="button"
//             onClick={clearSuccess}
//           >
//             <IoCloseOutline size={30} />
//           </button>
//         </div>{" "}
//         <OrderSuccessPopup clearSuccess={clearSuccess} />{" "}
//       </div>
//       <div
//         className={`delivery-form md:mt-0 mt-[320px] mb-10 ${orderSuccess ? "hidden" : " "
//           }`}
//       >
//         <div className="w-full flex justify-end">
//           <button
//             className="mb-4 cursor-pointer -mr-2 -mt-4"
//             type="button"
//             onClick={() => setIsCheckoutPopup(false)}
//           >
//             <IoCloseOutline size={30} />
//           </button>
//         </div>
//         <div className="mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:min-w-full xl:max-w-md rounded-lg border border-gray-200 p-5 mb-6">
//           <h2 className="text-center text-3xl">ক্যাশ অন ডেলিভারিতে অর্ডার করতে আপনার তথ্য দিন</h2>
//           <div className="flow-root">
//             <div className="my-3 divide-y divide-gray-200">
//               <dl className="flex items-center justify-between gap-4 py-3">
//                 <dt className="text-base font-normal text-gray-500">
//                   সাবটোটাল
//                 </dt>
//                 <dd className="text-base font-medium text-gray-900">
//                   ৳ {totalPrice}
//                 </dd>
//               </dl>

//               <dl className="flex items-center justify-between gap-4 py-3">
//                 <dt className="text-base font-normal text-gray-500">
//                   ডেলিভারি চার্জ (
//                   {formData.deliveryArea === "inside"
//                     ? "ঢাকার ভিতরে"
//                     : "ঢাকার বাইরে"}
//                   )
//                 </dt>
//                 <dd className="text-base font-medium text-gray-900">
//                   ৳ {calculateDeliveryCharge(formData.deliveryArea)}
//                 </dd>
//               </dl>

//               <dl className="flex items-center justify-between gap-4 py-3">
//                 <dt className="text-base font-bold text-gray-900">মোট</dt>
//                 <dd className="text-base font-bold text-gray-900">
//                   ৳{" "}
//                   {totalPrice + calculateDeliveryCharge(formData.deliveryArea)}
//                 </dd>
//               </dl>
//             </div>
//           </div>
//         </div>

//         {/* form */}
//         <form onSubmit={checkOut}>
//           <div className="input-grid">
//             <div className="input-group">
//               <label>আপনার নাম *</label>
//               <input
//                 name="name"
//                 onChange={handleChange}
//                 {...(orderData?.name && { value: orderData?.name })}
//                 type="text"
//                 placeholder="আপনার নাম"
//                 required
//               />
//             </div>

//             <div className="input-group">
//               <label>সম্পূর্ণ ঠিকানা *</label>
//               <input
//                 name="address"
//                 {...(orderData?.name && { value: orderData.address })}
//                 onChange={handleChange}
//                 type="text"
//                 id="your_email"
//                 placeholder="সম্পূর্ণ ঠিকানা"
//                 required
//               />
//             </div>

//             <div className="input-group">
//               <label>ফোন নাম্বার *</label>
//               <input
//                 name="phone"
//                 onChange={handleChange}
//                 {...(orderData?.name && { value: orderData.phone })}
//                 type="number"
//                 id="ফোন নাম্বার"
//                 placeholder="Phone"
//                 required
//               />
//             </div>

//             <div className="input-group">
//               <label>আপনার ইমেইল</label>
//               <input
//                 name="email"
//                 onChange={handleChange}
//                 value={getUser?.email}
//                 type="email"
//                 placeholder="name@flowbite.com"
//               />
//             </div>
//           </div>

//           <div className="delivery-options">
//             <label
//               className={`radio-option ${formData.deliveryArea === "inside" ? "active-option" : " "
//                 } `}
//             >
//               <input
//                 id="inside-dhaka"
//                 type="radio"
//                 value="inside"
//                 name="deliveryArea"
//                 checked={formData.deliveryArea === "inside"}
//                 onChange={handleChange}
//               />
//               ঢাকার ভিতরে (ডেলিভারি চার্জ: ৳৭০)
//             </label>

//             <label
//               className={`radio-option ${formData.deliveryArea === "outside" ? "active-option" : " "
//                 } `}
//             >
//               <input
//                 id="outside-dhaka"
//                 type="radio"
//                 value="outside"
//                 name="deliveryArea"
//                 checked={formData.deliveryArea === "outside"}
//                 onChange={handleChange}
//               />
//               ঢাকার বাইরে (ডেলিভারি চার্জ: ৳১২০)
//             </label>
//           </div>

//           <button type="submit" className="order-submit-btn">
//             অর্ডার করুন
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// async function sha256(message) {
//   // Encode as UTF-8
//   const msgBuffer = new TextEncoder().encode(message);

//   // Hash the message
//   const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

//   // Convert to hex string
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
// }



/* eslint-disable no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoCloseOutline } from "react-icons/io5";
import { CartContext } from "../context/CartContext";
import OrderSuccessPopup from "./OrderSuccessPopup";

export default function CheckoutPopup() {
  const { cart, totalPrice, setCart, setIsCheckoutPopup } = useContext(CartContext);

  const [formData, setFormData] = useState({ deliveryArea: "outside" });
  const [getUser, setGetUser] = useState(null);
  const [orderData, setOrderData] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
          value: totalPrice,
          currency: "BDT",
        },
      });
    }
    generateRandomText();
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

  const checkOut = async (e) => {
    e.preventDefault();

    const productDetails = JSON.parse(localStorage.getItem("cart")) || [];
    const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
    const totalValue = totalPrice + deliveryCharge;
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
        localStorage.setItem("cart", JSON.stringify([]));
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
  const grandTotal = totalPrice + deliveryCharge;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-3"
      onMouseDown={(e) => {
        // ✅ click outside to close
        if (e.target === e.currentTarget) closePopup();
      }}
    >
      {/* ✅ Modal */}
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

        {/* Body (scrollable) */}
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
                    <span className="font-medium">৳ {totalPrice}</span>
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
                    {/* <p className="mt-1 text-xs text-gray-500">Format: 01XXXXXXXXX বা +8801XXXXXXXXX</p> */}
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

      {/* ✅ tiny keyframe for pop animation */}
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

