/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Loader from "./Loader";
import { IoCartOutline } from "react-icons/io5";
import ProductSearch from "./ProductSearch";

const MAX_DESKTOP_CATS = 12;

const Header = ({ menuopen, setMenuOpen, setIsCartOpen }) => {
  const { cart, user } = useContext(CartContext);

  const [categories, setCategories] = useState([]);
  const [localOrderData, setLocalOrderData] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(true);

  // desktop hover dropdown state
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // ✅ NEW: More dropdown hover
  const [moreOpen, setMoreOpen] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const COLORS = useMemo(
    () => ({
      topBar: "#DF263A",
      accent: "#DF263A",
      headerBg: "#053A47",
    }),
    [],
  );

  // Fetch categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/products/categories`);
      const result = await response.json();

      const list = result?.[0] || [];
      setCategories(list);

      // init: null => not loaded yet
      const initialSub = {};
      list.forEach((c) => (initialSub[c.name] = null));
      setSubCategories(initialSub);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sub-categories for a category
  const loadSubCategories = async (categoryName) => {
    try {
      const response = await fetch(
        `${BASE_URL}/sub-category/category/${categoryName}`,
      );
      const result = await response.json();

      setSubCategories((prev) => ({
        ...prev,
        [categoryName]: result?.subcategories || [],
      }));
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      setSubCategories((prev) => ({ ...prev, [categoryName]: [] }));
    }
  };

  useEffect(() => {
    loadCategories();
    const guestOrders = JSON.parse(localStorage.getItem("guestOrders")) || [];
    setLocalOrderData(guestOrders);
  }, []);

  // Desktop: open dropdown + lazy-load subcats
  const handleCategoryHover = (categoryName) => {
    setHoveredCategory(categoryName);
    if (subCategories?.[categoryName] === null) {
      loadSubCategories(categoryName);
    }
  };

  const closeDesktopDropdown = () => setHoveredCategory(null);

  // Mobile: expand/collapse sub menu and lazy-load
  const handleMobileCategoryClick = async (e, categoryName) => {
    const current = subCategories?.[categoryName];

    if (current === null) {
      e.preventDefault();
      await loadSubCategories(categoryName);
      return;
    }

    if (Array.isArray(current)) {
      e.preventDefault();
      setSubCategories((prev) => ({
        ...prev,
        [categoryName]: { __collapsed: true, items: current },
      }));
      return;
    }

    if (current && current.__collapsed) {
      e.preventDefault();
      setSubCategories((prev) => ({
        ...prev,
        [categoryName]: current.items,
      }));
    }
  };

  const getMobileItems = (val) => {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) return val;
    if (val?.__collapsed) return val.items;
    return null;
  };

  const isMobileExpanded = (val) => {
    if (val === null || val === undefined) return false;
    if (Array.isArray(val)) return true;
    if (val?.__collapsed) return false;
    return false;
  };

  // ✅ Split categories for desktop menu
  const desktopCats = useMemo(
    () => categories.slice(0, MAX_DESKTOP_CATS),
    [categories],
  );
  const moreCats = useMemo(
    () => categories.slice(MAX_DESKTOP_CATS),
    [categories],
  );

  if (loading) return <Loader />;

  return (
    <div className="fixed top-0 z-50 w-full">
      <header>
        {/* Top bar */}
        <div
          className="text-center text-white py-2 lg:text-[18px] text-sm font-medium px-4"
          style={{ backgroundColor: COLORS.topBar }}
        >
          Order with confidence- Easy exchange, No worries
        </div>

        {/* Main header bar */}
        <div className="bg-white">
          <div className="px-4 mx-auto sm:px-6 lg:px-8">
            <nav className="relative flex items-center justify-between h-16 lg:h-20">
              {/* Left section */}
              <div className="hidden lg:flex items-center gap-6 text-[rgb(51 51 51)]">
                <Link
                  to="/outlets"
                  className="flex items-center gap-2 text-[18px] hover:text-[#DF263A] whitespace-nowrap"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                  <span>Find Store</span>
                </Link>

                <div className="h-5 w-px bg-white/25 hidden xl:block" />

                <div className="flex items-center gap-2 text-[12.5px]">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 3h3l2 5-2 1c1.2 2.6 3.4 4.8 6 6l1.2-2 5 2V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="leading-tight">
                    <div className="text-[18px] text-[#333333]">
                      Customer Care
                    </div>
                    <div className="font-semibold text-[18px]">
                     
                      +88 01607975724
                    </div>
                  </div>
                </div>

                <span
                  className="cursor-pointer ml-2 text-[18px] font-extrabold tracking-wide whitespace-nowrap hidden xl:block"
                  style={{ color: COLORS.accent }}
                >
                  HOT OFFER
                </span>
              </div>

              {/* Center logo */}
              <div className=" lg:ml-10">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    className="w-auto h-8 lg:h-10 rounded-md"
                    src="../../logo.png"
                    alt="Logo"
                  />
                </Link>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3 lg:gap-5 ml-auto">
                <div className="relative hidden md:flex w-[280px] lg:w-[320px] xl:w-[380px] flex-shrink-0">
                  <ProductSearch />
                </div>

                <div className="hidden lg:flex items-center gap-4 text-[#333333]">
                  {/* <Link
                    to="/cart"
                    className="relative hover:text-black flex-shrink-0"
                  >
                    <div className="absolute -top-2 -right-2">
                      <p className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                        {cart.length > 0 ? cart.length : 0}
                      </p>
                    </div>
                    <IoCartOutline size={25} />
                  </Link> */}
                  <button
                    onClick={()=>setIsCartOpen(true)}
                    className="relative hover:text-black flex-shrink-0 cursor-pointer"
                  >
                    <div className="absolute -top-2 -right-2">
                      <p className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                        {cart.length > 0 ? cart.length : 0}
                      </p>
                    </div>
                    <IoCartOutline size={25} />
                  </button>

                  {/* <Link
                    to="/wishlist"
                    className="hover:text-black flex-shrink-0"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21s-7-4.6-9.5-9A5.7 5.7 0 0 1 12 5a5.7 5.7 0 0 1 9.5 7c-2.5 4.4-9.5 9-9.5 9Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link> */}

                  <div className="w-full space-y-1">
                    {user?.user?.uid ? (
                      <Link
                        to="/account"
                        className="text-[18px] block w-full py-2 text-base font-medium text-black hover:bg-white/10 rounded px-2 whitespace-nowrap"
                        onClick={() => setMenuOpen(false)}
                      >
                        Account
                      </Link>
                    ) : (
                      <div
                        className="block w-full py-2 text-base font-medium text-[#333333] hover:bg-white/10 rounded px-2 whitespace-nowrap"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Link to="/login">Login</Link> /{" "}
                        <Link to="/register">Register</Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile cart */}
                <button
                  onClick={()=>setIsCartOpen(true)}
                  className="flex items-center justify-center lg:hidden relative text-[#333333] flex-shrink-0 cursor-pointer"
                  aria-label="Cart"
                >
                  <div className="absolute -top-2 -right-2">
                    <p className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                      {cart.length > 0 ? cart.length : 0}
                    </p>
                  </div>
                  <IoCartOutline size={22} />
                </button>
                {/* <Link
                  to="/cart"
                  className="flex items-center justify-center lg:hidden relative text-[#333333] flex-shrink-0"
                  aria-label="Cart"
                >
                  <div className="absolute -top-2 -right-2">
                    <p className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                      {cart.length > 0 ? cart.length : 0}
                    </p>
                  </div>
                  <IoCartOutline size={22} />
                </Link> */}

                {/* Mobile menu button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuopen);
                  }}
                  className="inline-flex p-2 text-[#333333] transition-all duration-200 rounded-md lg:hidden focus:bg-black/20 hover:bg-black/20 flex-shrink-0"
                  aria-label="Menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* ✅ Category nav (desktop) with MORE dropdown */}
        <div className="bg-white border-b border-t border-gray-300 hidden lg:block">
          <div className="px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-center gap-6 whitespace-nowrap">
              {/* First 12 categories */}
              {desktopCats.map((category) => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => handleCategoryHover(category.name)}
                  onMouseLeave={closeDesktopDropdown}
                >
                  <Link
                    to={`/category/${category.name}`}
                    className="text-[16px] font-bold tracking-wide text-[#1f2a2e] hover:underline uppercase"
                    style={{ textDecorationColor: COLORS.accent }}
                  >
                    {category.name}
                  </Link>
                </div>
              ))}

              {/* MORE dropdown */}
              {moreCats.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setMoreOpen(true)}
                  onMouseLeave={() => setMoreOpen(false)}
                >
                  <button
                    type="button"
                    className="text-[16px] font-bold tracking-wide text-[#1f2a2e] cursor-pointer hover:text-[#DF263A] hover:underline uppercase flex items-center gap-1"
                  >
                    MORE <span className="text-[12px]">▾</span>
                  </button>

                  {moreOpen && (
                    <div className="absolute top-full right-0 mt-0 w-56 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden z-[9999]">
                      <div className="py-2">
                        {moreCats.map((c) => (
                          <Link
                            key={c.id}
                            to={`/category/${c.name}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu (unchanged) */}
        <nav
          className={`fixed inset-y-0 left-0 w-full transform transition-transform duration-300 lg:hidden ${
            menuopen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: COLORS.headerBg, top: "60px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full overflow-y-auto max-h-[85vh] px-4 sm:px-6">
            <div className="flex items-center justify-between py-4 sticky top-0 bg-[#053A47] z-10">
              <p className="text-md font-semibold tracking-widest uppercase text-white">
                Menu
              </p>

              <button
                onClick={() => setMenuOpen(false)}
                type="button"
                className="inline-flex p-2 text-white transition-all duration-200 rounded-md hover:bg-white/10"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="pb-20">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="py-2 text-base font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>

                {categories.map((category) => {
                  const val = subCategories?.[category.name];
                  const items = getMobileItems(val);
                  const hasItems = Array.isArray(items) && items.length > 0;
                  const expanded = isMobileExpanded(val);

                  return (
                    <div key={category.id} className="select-none">
                      <Link
                        to={`/category/${category.name}`}
                        className="py-2 text-base font-medium text-white flex items-center justify-between capitalize"
                        onClick={(e) =>
                          handleMobileCategoryClick(e, category.name)
                        }
                      >
                        {category.name}
                        {(val === null || hasItems) && (
                          <svg
                            className={`w-4 h-4 text-white transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </Link>

                      {val === null && (
                        <div className="ml-4 py-2 text-sm text-white/70">
                          Loading...
                        </div>
                      )}

                      {expanded && hasItems && (
                        <div className="ml-4">
                          {items.map((subCat) => (
                            <Link
                              key={subCat}
                              to={`/sub-category/${category.name}/${subCat}`}
                              className="block py-2 text-sm text-white/90 hover:bg-white/10 rounded px-2 capitalize"
                              onClick={() => setMenuOpen(false)}
                            >
                              {subCat}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <Link
                  to="/shop"
                  className="py-2 text-base font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Shop
                </Link>
              </div>

              <hr className="my-4 border-white/20" />

              <div className="flex flex-col space-y-2">
                {user?.user?.uid ? (
                  <Link
                    to="/account"
                    className="py-2 text-base font-medium text-black"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                ) : (
                  <>
                    {!!localOrderData?.length && (
                      <Link
                        to="/orders"
                        className="py-2 text-base font-medium text-white"
                        onClick={() => setMenuOpen(false)}
                      >
                        See Orders
                      </Link>
                    )}
                    <Link
                      to="/register"
                      className="py-2 text-base font-medium text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                    <Link
                      to="/login"
                      className="py-2 text-base font-medium text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;
