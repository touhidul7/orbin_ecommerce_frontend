/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { IoCloseOutline } from "react-icons/io5";

export default function CheckoutPopup({ closeModal }) {
  const { cart, totalPrice, setCart, setIsCheckoutPopup } =
    useContext(CartContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    deliveryArea: "outside", // Default to outside Dhaka
  });

  const [getUser, setGetUser] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Generate random order ID
  const [randomId, setRandomId] = useState("");
  const generateRandomText = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRandomId(result);
  };

  // Track ViewCart event when component mounts
  useEffect(() => {
    if (cart.length > 0) {
      // Meta Pixel ViewCart
      // ReactPixel.track('ViewCart', {
      //   content_ids: cart.map(item => item.id),
      //   contents: cart.map(item => ({
      //     id: item.id,
      //     quantity: item.quantity,
      //     item_price: item.selling_price
      //   })),
      //   content_type: 'product',
      //   value: totalPrice,
      //   currency: 'BDT',
      //   num_items: cart.length
      // });

      // Google Analytics view_cart
      window.dataLayer.push({
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const calculateDeliveryCharge = (area) => {
    return area === "inside" ? 70 : 120;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setGetUser(user?.user);
  }, []);

  const validateBangladeshiPhoneNumber = (phone) => {
    const regex = /^(?:\+8801|01)\d{9}$/;
    return regex.test(phone);
  };

  // Format date for guest orders
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const currentDate = formatDate(new Date());

  const checkOut = async (e) => {
    e.preventDefault();

    const productDetails = JSON.parse(localStorage.getItem("cart")) || [];
    const deliveryCharge = calculateDeliveryCharge(formData.deliveryArea);
    const totalValue = totalPrice + deliveryCharge;
    const areaName =
      formData.deliveryArea === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে";

    // Get user data (logged in or guest)
    const userEmail = getUser ? getUser.email : formData?.email;
    const userName = getUser ? getUser.displayName : formData.name;
    const userPhone = getUser
      ? orderData?.phone || formData.phone
      : formData.phone;

    const phone = userPhone;

    if (!validateBangladeshiPhoneNumber(phone)) {
      toast.error(
        "Invalid Bangladeshi phone number. Please use the format +8801XXXXXXXXX or 01XXXXXXXXX."
      );
      return;
    }

    if (!getUser && (!formData.name || !formData.address || !formData.phone)) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const order = {
      user_id: getUser ? getUser.uid : null,
      cart: productDetails,
      name: formData.name,
      client_order_id: randomId,
      email: userEmail,
      address: `${
        getUser ? orderData?.address || formData.address : formData.address
      }, ${areaName}`,
      phone: phone,
      total_price: totalValue,
      p_method: "Cash On Delivery",
    };

    try {
      // Prepare hashed user data
      const hashedEmail = userEmail
        ? await sha256(userEmail.toLowerCase())
        : undefined;
      const hashedPhone = userPhone ? await sha256(userPhone) : undefined;
      const hashedName = userName
        ? await sha256(userName.toLowerCase())
        : undefined;
      const hashedUserId = getUser?.uid ? await sha256(getUser.uid) : undefined;

      // Meta Pixel Purchase with user data
      // ReactPixel.track('Purchase', {
      //   value: totalValue,
      //   currency: 'BDT',
      //   content_ids: productDetails.map(item => item.id),
      //   contents: productDetails.map(item => ({
      //     id: item.id,
      //     quantity: item.quantity,
      //     item_price: item.selling_price
      //   })),
      //   content_type: 'product',
      //   order_id: randomId,
      //   em: hashedEmail,
      //   ph: hashedPhone,
      //   fn: hashedName,
      //   external_id: hashedUserId
      // });

      // Google Analytics Purchase with user data
      window.dataLayer.push({
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
            address: {
              first_name: hashedName,
            },
          },
        },
      });

      // Track CompleteRegistration for guest checkout
      if (!getUser) {
        // ReactPixel.track('CompleteRegistration');

        // Google Analytics for guest registration
        window.dataLayer.push({
          event: "sign_up",
          method: "guest_checkout",
        });
      }

      const response = await fetch(`${BASE_URL}/order/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        localStorage.setItem("order", JSON.stringify(order));
        toast.success("Your Order is Placed Successfully");

        // Save guest order (for non-logged-in users)
        if (!getUser) {
          const guestOrderWithDate = {
            ...order,
            created_at: currentDate,
            order_id: randomId,
          };

          const guestOrders =
            JSON.parse(localStorage.getItem("guestOrders")) || [];
          guestOrders.push(guestOrderWithDate);
          localStorage.setItem("guestOrders", JSON.stringify(guestOrders));
        }

        setCart([]);
        localStorage.setItem("cart", JSON.stringify([]));

        navigate("/order-success");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Order placement failed");
      }
    } catch (error) {
      toast.error("Failed to place your order, please try again later.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="delivery-form">
        <div className="w-full flex justify-end">
          <button className="mb-4 cursor-pointer -mr-2 -mt-4" type="button" onClick={() => setIsCheckoutPopup(false)}>
            <IoCloseOutline size={30} />

          </button>
        </div>
        <div className="mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:min-w-full xl:max-w-md rounded-lg border border-gray-200 p-5">
          <div className="flow-root">
            {/* <CartSection /> */}
            <div className="my-3 divide-y divide-gray-200">
              <dl className="flex items-center justify-between gap-4 py-3">
                <dt className="text-base font-normal text-gray-500">
                  সাবটোটাল
                </dt>
                <dd className="text-base font-medium text-gray-900">
                  ৳ {totalPrice}
                </dd>
              </dl>

              <dl className="flex items-center justify-between gap-4 py-3">
                <dt className="text-base font-normal text-gray-500">
                  ডেলিভারি চার্জ (
                  {formData.deliveryArea === "inside"
                    ? "ঢাকার ভিতরে"
                    : "ঢাকার বাইরে"}
                  )
                </dt>
                <dd className="text-base font-medium text-gray-900">
                  ৳ {calculateDeliveryCharge(formData.deliveryArea)}
                </dd>
              </dl>

              <dl className="flex items-center justify-between gap-4 py-3">
                <dt className="text-base font-bold text-gray-900">মোট</dt>
                <dd className="text-base font-bold text-gray-900">
                  ৳{" "}
                  {totalPrice + calculateDeliveryCharge(formData.deliveryArea)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* form */}
        <form onSubmit={checkOut}>
          <div className="input-grid">
            <div className="input-group">
              <label>আপনার নাম *</label>
              <input
                name="name"
                onChange={handleChange}
                {...(orderData?.name && { value: orderData?.name })}
                type="text"
                placeholder="আপনার নাম"
                required
              />
            </div>

            <div className="input-group">
              <label>সম্পূর্ণ ঠিকানা *</label>
              <input
                name="address"
                {...(orderData?.name && { value: orderData.address })}
                onChange={handleChange}
                type="text"
                id="your_email"
                placeholder="সম্পূর্ণ ঠিকানা"
                required
              />
            </div>

            <div className="input-group">
              <label>ফোন নাম্বার *</label>
              <input
                name="phone"
                onChange={handleChange}
                {...(orderData?.name && { value: orderData.phone })}
                type="number"
                id="ফোন নাম্বার"
                placeholder="Phone"
                required
              />
            </div>

            <div className="input-group">
              <label>আপনার ইমেইল</label>
              <input
                name="email"
                onChange={handleChange}
                value={getUser?.email}
                type="email"
                placeholder="name@flowbite.com"
              />
            </div>
          </div>

          <div className="delivery-options">
            <label className="radio-option">
              <input
                id="inside-dhaka"
                type="radio"
                value="inside"
                name="deliveryArea"
                checked={formData.deliveryArea === "inside"}
                onChange={handleChange}
              />
              ঢাকার ভিতরে (ডেলিভারি চার্জ: ৳৭০)
            </label>

            <label className="radio-option active-option">
              <input
                id="outside-dhaka"
                type="radio"
                value="outside"
                name="deliveryArea"
                checked={formData.deliveryArea === "outside"}
                onChange={handleChange}
              />
              ঢাকার বাইরে (ডেলিভারি চার্জ: ৳১২০)
            </label>
          </div>

          <button type="submit" className="order-submit-btn">
            অর্ডার করুন
          </button>
        </form>
      </div>
    </div>
  );
}

async function sha256(message) {
  // Encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // Hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
