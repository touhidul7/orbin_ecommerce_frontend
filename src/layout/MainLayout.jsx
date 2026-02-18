import React, { useState, useContext } from 'react';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import MainFooter from '../components/MainFooter';
import ScrollToTop from '../components/ScrollToTop';
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';
import CartSlide from '../components/CartSlide';
import CheckoutPopup from '../components/CheckoutPopup';
import { CartContext } from "../context/CartContext";

const MainLayout = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
      const [menuopen, setMenuOpen] = useState(false);
      const {isCheckoutPopup}= useContext(CartContext);
    return (
        <div className='lg:pt-20 pt-16' onClick={() => menuopen? setMenuOpen(false): ""}>
            {/* <CartProvider> */}
                <Header menuopen={menuopen} setIsCartOpen={setIsCartOpen} setMenuOpen={setMenuOpen}/>
                
                <ScrollToTop />
                <Outlet context={{isCartOpen, setIsCartOpen}}/>
                <MainFooter />
                <Toaster />
                <CartSlide isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}/>
            <div className={` ${isCheckoutPopup ? "block" : "hidden"}`}><CheckoutPopup/></div>
            {/* </CartProvider> */}
        </div>
    );
};

export default MainLayout;
