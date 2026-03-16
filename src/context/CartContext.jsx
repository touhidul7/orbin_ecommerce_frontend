/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import ReactPixel from 'react-facebook-pixel';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [user, setUser] = useState(null);
    const [order, setOrder] = useState([]);
    const [isCheckoutPopup, setIsCheckoutPopup] = useState(null);
    // const navigate = useNavigate();

    const ORDER_LOCK_KEY = "last_order_time";
    const ORDER_BLOCK_DURATION = 30 * 60 * 1000; // 1 hour in milliseconds

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    // ✅ Calculate total price whenever the cart updates
    useEffect(() => {
        const total = cart.reduce(
            (sum, item) => sum + item.selling_price * item.quantity,
            0
        );
        setTotalPrice(total);
    }, [cart]);

    // ✅ Remove item from cart
    const removeFromCart = (id) => {
        const updatedCart = cart.filter((item) => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // ✅ Check if user is blocked from ordering
    const isOrderBlocked = () => {
        const lastOrderTime = localStorage.getItem(ORDER_LOCK_KEY);

        if (!lastOrderTime) return false;

        const now = Date.now();
        const diff = now - Number(lastOrderTime);

        if (diff < ORDER_BLOCK_DURATION) {
            const remainingMs = ORDER_BLOCK_DURATION - diff;
            const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

            toast.error(
                `আপনি ইতোমধ্যে একটি অর্ডার করেছেন। নতুন অর্ডার দেওয়ার আগে ${remainingMinutes} মিনিট অপেক্ষা করুন।`
            );
            return true;
        }

        return false;
    };

    // ✅ Save order time
    const saveOrderTime = () => {
        localStorage.setItem(ORDER_LOCK_KEY, Date.now().toString());
    };

    // add to cart
    const addToCart = (product, selectedColor, selectedSize) => {
        let updatedCart = [...cart];

        const existingProduct = updatedCart.find(
            (item) =>
                item.id === product.id &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
        );

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            updatedCart.push({
                ...product,
                quantity: 1,
                selectedColor,
                selectedSize,
            });

            // Track AddToCart event
            /* ReactPixel.track('AddToCart', {
                content_ids: [product.id],
                content_name: product.name,
                content_type: 'product',
                value: product.selling_price,
                currency: 'BDT',
                contents: [{
                    id: product.id,
                    quantity: 1,
                    item_price: product.selling_price
                }]
            }); */

            if (window.dataLayer) {
                window.dataLayer.push({
                    event: "add_to_cart",
                    ecommerce: {
                        items: [
                            {
                                item_id: product.id,
                                item_name: product.product_name,
                                price: product.selling_price,
                                item_category: product.select_category,
                                quantity: 1,
                            },
                        ],
                    },
                });
            }
        }

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // ✅ Order now with 1 hour restriction
    const orderNow = (product, selectedColor, selectedSize) => {
        if (isOrderBlocked()) {
            return;
        }

        let updatedCart = [...cart];

        const existingProduct = updatedCart.find(
            (item) =>
                item.id === product.id &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
        );

        if (existingProduct) {
            existingProduct.quantity += 1;
            toast.success("Cart Updated!");
        } else {
            updatedCart.push({
                ...product,
                quantity: 1,
                selectedColor,
                selectedSize,
            });
            toast.success("Product added to cart!");
        }

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // ✅ store order placed time
        saveOrderTime();

        // navigate('/checkout')
        setIsCheckoutPopup(true);
    };

    // ✅ Increase item quantity
    const increaseQuantity = (id) => {
        const updatedCart = cart.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // ✅ Decrease item quantity
    const decreaseQuantity = (id) => {
        const updatedCart = cart
            .map((item) =>
                item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0);

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // user login or not
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        setUser(user);
    }, []);

    // order from localStorage
    useEffect(() => {
        const order = JSON.parse(localStorage.getItem("order"));
        setOrder(order);
    }, []);

    return (
        <CartContext.Provider
            value={{
                order,
                setCart,
                setUser,
                cart,
                addToCart,
                totalPrice,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                orderNow,
                user,
                setIsCheckoutPopup,
                isCheckoutPopup,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};