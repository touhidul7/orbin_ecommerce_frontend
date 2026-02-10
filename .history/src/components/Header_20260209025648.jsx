/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Loader from "./Loader";
import { IoCartOutline } from "react-icons/io5";

const Header = ({ menuopen, setMenuOpen }) => {
  const { cart, user } = useContext(CartContext);

  const [categories, setCategories] = useState([]);
  const [localOrderData, setLocalOrderData] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [accountOpen, setAccountOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // desktop hover dropdown state
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const COLORS = useMemo(
    () => ({
      topBar: "#AD0101",
      accent: "#DF263A",
      headerBg: "#053A47",
    }),
    []
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
        `${BASE_URL}/sub-category/category/${categoryName}`
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

    // not loaded => load & expand
    if (current === null) {
      e.preventDefault();
      await loadSubCategories(categoryName);
      return;
    }

    // loaded array => toggle collapse/expand by special marker
    if (Array.isArray(current)) {
      e.preventDefault();
      setSubCategories((prev) => ({
        ...prev,
        [categoryName]: { __collapsed: true, items: current },
      }));
      return;
    }

    // collapsed marker => expand back
    if (current && current.__collapsed) {
      e.preventDefault();
      setSubCategories((prev) => ({
        ...prev,
        [categoryName]: current.items,
      }));
    }
  };

  // Helpers for mobile state shape
  const getMobileItems = (val) => {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) return val;
    if (val?.__collapsed) return val.items; // still keep items
    return null;
  };

  const isMobileExpanded = (val) => {
    if (val === null || val === undefined) return false;
    if (Array.isArray(val)) return true;
    if (val?.__collapsed) return false;
    return false;
  };

  if (loading) return <Loader />;

  return (
    <div className="fixed top-0 z-50 w-full">
      <header>
        {/* Top bar */}
        <div
          className="text-center text-white py-2 text-[12px] font-medium"
          style={{ backgroundColor: COLORS.topBar }}
        >
          Order with confidence- Easy exchange, No worries
        </div>

        {/* Main header bar (like screenshot) */}
        <div style={{ backgroundColor: COLORS.headerBg }}>
          <div className="px-4 mx-auto sm:px-6 lg:px-8">
            <nav className="relative flex items-center justify-between h-16 lg:h-20">
              {/* Left: Find Store + Customer Care + Hot Offer */}
              <div className="hidden lg:flex items-center gap-6 text-white/90">
                <Link
                  to="/stores"
                  className="flex items-center gap-2 text-[13px] hover:text-white"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
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

                <div className="h-5 w-px bg-white/25" />

                <div className="flex items-center gap-2 text-[12.5px]">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 3h3l2 5-2 1c1.2 2.6 3.4 4.8 6 6l1.2-2 5 2V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="leading-tight">
                    <div className="text-[11px] text-white/70">
                      Customer Care
                    </div>
                    <div className="font-semibold">+88 01709306560</div>
                  </div>
                </div>

                <span
                  className="ml-2 text-[14px] font-extrabold tracking-wide"
                  style={{ color: COLORS.accent }}
                >
                  HOT OFFER
                </span>
              </div>

              {/* Center: Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    className="w-auto h-8 lg:h-10"
                    src="https://orbin-beta.vercel.app/logo.png"
                    alt="Logo"
                  />
                </Link>
              </div>

              {/* Right: Search + icons */}
              <div className="flex items-center gap-4 lg:gap-5">
                {/* Search (desktop) */}
                <div className="relative hidden md:flex w-[320px] lg:w-[380px]">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#053A47]/70">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <path
                        d="M16.5 16.5 21 21"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="h-10 w-full rounded-full bg-white pl-11 pr-4 text-[13px] text-[#053A47] placeholder:text-[#053A47]/50 outline-none ring-1 ring-white/10 focus:ring-2"
                    style={{ boxShadow: "0 0 0 0px transparent" }}
                  />
                </div>

                {/* Desktop account + icons */}
                <div className="hidden lg:flex items-center gap-4 text-white/90">
                  <Link to="/cart" className="relative hover:text-white">
                    <div className="absolute -top-2 -right-2">
                      <p className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                        {cart.length > 0 ? cart.length : 0}
                      </p>
                    </div>
                    <IoCartOutline size={22} />
                  </Link>

                  <Link to="/wishlist" className="hover:text-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21s-7-4.6-9.5-9A5.7 5.7 0 0 1 12 5a5.7 5.7 0 0 1 9.5 7c-2.5 4.4-9.5 9-9.5 9Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                 {/* Mobile Account Dropdown */}
<div className="select-none">
  <button
    type="button"
    onClick={() => setAccountOpen((s) => !s)}
    className="w-full py-2 text-base font-medium text-white transition-all duration-200 flex items-center justify-between"
  >
    Account
    <svg
      className={`w-4 h-4 text-white transition-transform ${
        accountOpen ? "rotate-180" : ""
      }`}
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
  </button>

  {accountOpen && (
    <div className="ml-4">
      {user?.user?.uid ? (
        <Link
          to="/account"
          className="block py-2 text-sm text-white/90 hover:bg-white/10 rounded px-2"
          onClick={() => {
            setMenuOpen(false);
            setAccountOpen(false);
          }}
        >
          My Account
        </Link>
      ) : (
        <>
          <Link
            to="/login"
            className="block py-2 text-sm text-white/90 hover:bg-white/10 rounded px-2"
            onClick={() => {
              setMenuOpen(false);
              setAccountOpen(false);
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block py-2 text-sm text-white/90 hover:bg-white/10 rounded px-2"
            onClick={() => {
              setMenuOpen(false);
              setAccountOpen(false);
            }}
          >
            Register
          </Link>
        </>
      )}
    </div>
  )}
</div>

                </div>

                {/* Mobile cart */}
                <Link
                  to="/cart"
                  className="flex items-center justify-center lg:hidden relative text-white"
                  aria-label="Cart"
                >
                  <div className="absolute -top-2 -right-2">
                    <p className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                      {cart.length > 0 ? cart.length : 0}
                    </p>
                  </div>
                  <IoCartOutline size={22} />
                </Link>

                {/* Mobile menu button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuopen);
                  }}
                  className="inline-flex p-2 text-white transition-all duration-200 rounded-md lg:hidden focus:bg-black/20 hover:bg-black/20"
                  aria-label="Menu"
                >
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
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

        {/* Category nav (desktop) */}
        <div className="bg-white border-b border-gray-100 hidden lg:block">
          <div className="px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-center gap-7">
              {categories.map((category) => {
                const val = subCategories?.[category.name];
                const items =
                  Array.isArray(val) ? val : val?.items || (val === null ? null : []);
                const hasItems = Array.isArray(items) && items.length > 0;
                const isHovered = hoveredCategory === category.name;

                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => handleCategoryHover(category.name)}
                    onMouseLeave={closeDesktopDropdown}
                  >
                    <Link
                      to={`/category/${category.name}`}
                      className="text-[12px] font-medium tracking-wide text-[#1f2a2e] hover:underline"
                      style={{ textDecorationColor: COLORS.accent }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {category.name}
                        {/* show arrow if loading or has items */}
                        {(val === null || hasItems) && (
                          <svg
                            className="w-4 h-4"
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
                      </span>
                    </Link>

                    {/* Dropdown */}
                    {isHovered && (
                      <div className="absolute left-0 top-full pt-2 z-50">
                        <div className="w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
                          {/* If still loading subcats for this category */}
                          {val === null && (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              Loading...
                            </div>
                          )}

                          {/* Has items */}
                          {hasItems &&
                            items.map((subCat) => (
                              <Link
                                key={subCat}
                                to={`/sub-category/${category.name}/${subCat}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                              >
                                {subCat}
                              </Link>
                            ))}

                          {/* Loaded but empty */}
                          {Array.isArray(items) && items.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No sub-categories
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav
          className={`py-4 lg:hidden ${menuopen ? "block" : "hidden"}`}
          style={{ backgroundColor: COLORS.headerBg }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
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

            <div className="mt-6">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="py-2 text-base font-medium text-white transition-all duration-200 capitalize"
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
                        className="py-2 text-base font-medium text-white transition-all duration-200 flex items-center justify-between capitalize"
                        onClick={(e) => handleMobileCategoryClick(e, category.name)}
                      >
                        {category.name}
                        {(val === null || hasItems) && (
                          <svg
                            className={`w-4 h-4 text-white transition-transform ${
                              expanded ? "rotate-180" : ""
                            }`}
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

                      {/* Loading state */}
                      {val === null && (
                        <div className="ml-4 py-2 text-sm text-white/70">
                          Loading...
                        </div>
                      )}

                      {/* Expanded list */}
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
                  className="py-2 text-base font-medium text-white transition-all duration-200 capitalize"
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
                    className="py-2 text-base font-medium text-white transition-all duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                ) : (
                  <>
                    {!!localOrderData?.length && (
                      <Link
                        to="/orders"
                        className="py-2 text-base font-medium text-white transition-all duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        See Orders
                      </Link>
                    )}
                    <Link
                      to="/register"
                      className="py-2 text-base font-medium text-white transition-all duration-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                    <Link
                      to="/login"
                      className="py-2 text-base font-medium text-white transition-all duration-200"
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

      {/* click outside closes mobile menu */}
      {menuopen && (
        <button
          aria-label="Backdrop"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Header;
