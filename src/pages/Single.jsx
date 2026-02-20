/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import RelatedProduct from "../components/RelatedProduct";
import { CartContext } from "../context/CartContext";
import { IoLogoWhatsapp } from "react-icons/io";
import { RiMessengerLine } from "react-icons/ri";
import { FaCartShopping } from "react-icons/fa6";
import toast from "react-hot-toast";
import ProductDisclaimerTrust from "../components/ProductDisclaimerTrust";

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

  const next = [...cart];
  const idx = next.findIndex((x) => Number(x.id) === id);
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
  if (!id) return cart;
  return (cart || []).filter((x) => Number(x.id) !== id);
}

const Single = () => {
  const { id } = useParams();
  const { isCartOpen, setIsCartOpen } = useOutletContext();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const [selectedImg, setSelectedImg] = useState(null);

  // ✅ NEW: image preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { cart, addToCart, orderNow, setCart } = useContext(CartContext);

  const [selectedSize, setSelectedSize] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;

  const isInCart = useMemo(() => {
    const pid = Number(data?.id);
    if (!pid) return false;
    return (cart || []).some((item) => Number(item.id) === pid);
  }, [cart, data]);

  useEffect(() => {
    if (data) {
      window.dataLayer?.push({
        event: "view_item",
        ecommerce: {
          items: [
            {
              item_id: data.id,
              item_name: data.product_name,
              price: data.selling_price,
              item_category: data.select_category,
              quantity: 1,
            },
          ],
        },
      });
    }
  }, [data]);

  const getColorCode = (colorName) => {
    const colorMap = {
      yellow: "#FFFF00",
      blue: "#0000FF",
      gray: "#808080",
      red: "#FF0000",
      green: "#008000",
      black: "#000000",
      white: "#FFFFFF",
      orange: "#FFA500",
      purple: "#800080",
      pink: "#FFC0CB",
      brown: "#A52A2A",
      chocolate: "#7B3F00",
      master: "#DE7E01",
    };
    const normalizedColor = colorName?.toLowerCase().trim();
    return colorMap[normalizedColor] || "#CCCCCC";
  };

  const colors = data?.color
    ? data.color.split(",").map((color) => ({
        name: color.trim(),
        code: getColorCode(color.trim()),
      }))
    : [];

  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (data?.color) {
      const firstColor = data.color.split(",")[0].trim();
      setSelectedColor({ name: firstColor, code: getColorCode(firstColor) });
    } else {
      setSelectedColor(null);
    }

    if (data?.size) {
      const firstSize = data.size.split(",")[0].trim();
      setSelectedSize(firstSize);
    } else {
      setSelectedSize(null);
    }
  }, [data]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/products/${id}`);
      const result = await response.json();
      setData(result[0]);

      if (result[0]?.select_category) {
        loadRelatedProducts(result[0].select_category, result[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (select_category, currentProductId) => {
    setRelatedLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/products/category/${select_category}`);
      const result = await response.json();
      const filteredProducts = result[0].filter(
        (product) => product.id !== parseInt(currentProductId)
      );
      setRelatedProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const recommendedList = useMemo(() => {
    if (!data) return [];

    const recs = normalizeRecommendedProducts(data, { depth: 1 });
    const inCartIds = new Set((cart || []).map((c) => Number(c.id)));

    return recs.filter((p) => {
      const rid = Number(p?.id);
      if (!rid) return false;
      if (Number(data?.id) === rid) return false;
      return !inCartIds.has(rid);
    });
  }, [data, cart]);

  const isRecChecked = (pid) => {
    const idNum = Number(pid);
    if (!idNum) return false;
    return (cart || []).some((c) => Number(c.id) === idNum);
  };

  const toggleRecommended = (product, checked) => {
    const current = getCartFromStorage();

    let next;
    if (checked) {
      next = upsertCartItem(current, product, 1);
      toast.success("Recommended item added ✅");
    } else {
      next = removeCartItem(current, product?.id);
      toast.success("Recommended item removed ✅");
    }

    setCartToStorage(next);
    setCart?.(next);
  };

  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor) {
      alert("Please select a color first");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToCart(data, selectedColor?.name, selectedSize || null);
    setIsCartOpen(!isCartOpen);
  };

  const handleOrderNow = () => {
    if (colors.length > 0 && !selectedColor) {
      alert("Please select a color first");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    orderNow(data, selectedColor?.name, selectedSize || null);
  };

  useEffect(() => {
    loadData();
    setSelectedImg(null);
    setSelectedSize(null);
    setIsPreviewOpen(false);
  }, [id]);

  // ✅ NEW: helpers for preview
  const currentImageSrc = useMemo(() => {
    if (!data) return "";
    return selectedImg
      ? `${IMAGE_URL}/admin/product/gallery/${selectedImg}`
      : `${IMAGE_URL}/admin/product/${data.product_image}`;
  }, [data, selectedImg, IMAGE_URL]);

  const openPreview = () => {
    if (!currentImageSrc) return;
    setIsPreviewOpen(true);
  };

  const closePreview = () => setIsPreviewOpen(false);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closePreview();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isPreviewOpen]);

  return (
    <>
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      ) : (
        <div>
          <div className="bg-white-100 py-8 mt-10 lg:pt-25">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 -mx-4 align-center">
                <div className="md:flex-1 px-4">
                  {/* ✅ selected / on-view Product Image (Hover zoom + click popup) */}
                  <div
                    className="lg:h-[460px] text-center flex justify-center rounded-lg bg-white mb-4 border border-gray-100 p-2 group relative overflow-hidden cursor-zoom-in"
                    onClick={openPreview}
                    title="Click to zoom"
                  >
                    {/* small hint on hover */}
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                        Click to zoom
                      </span>
                    </div>

                    <img
                      className="h-full w-auto object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                      src={currentImageSrc}
                      alt={data.product_name}
                    />
                  </div>

                  {/* Product Gallery Slider */}
                  <div className="flex gap-4 overflow-x-auto py-2">
                    <button
                      onClick={() => setSelectedImg("")}
                      className="min-w-[80px] h-auto cursor-pointer border border-gray-200 hover:shadow-sm flex-shrink-0"
                    >
                      <img
                        src={`${IMAGE_URL}/admin/product/${data.product_image}`}
                        alt="Product view"
                        className="w-24 h-auto object-cover"
                      />
                    </button>

                    {data?.image_gallary?.map((item, i) => (
                      <button
                        onClick={() => setSelectedImg(item)}
                        className="min-w-[80px] h-auto cursor-pointer hover:shadow-sm border border-gray-200 flex-shrink-0"
                        key={i}
                      >
                        <img
                          src={`${IMAGE_URL}/admin/product/gallery/${item}`}
                          alt={`Product view ${i + 1}`}
                          className="w-24 h-auto object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:flex-1 px-4 lg:pt-0 pt-5">
                  <p className="text-gray-600 text-sm mb-4">{data.select_category}</p>

                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {data.product_name}
                  </h2>

                  <div className="flex mb-4">
                    <div className="mr-4">
                      <span className="text-gray-800 text-2xl font-semibold">
                        ৳ {data.selling_price}
                      </span>
                      {data.regular_price && (
                        <span className="line-through ml-2 text-red-500 text-xl">
                          ৳{data.regular_price}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-gray-700 text-xl">
                        Availability:{" "}
                      </span>
                      <span className="text-gray-600">{data.availability}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-600 text-sm mt-2">
                      {data.p_short_des?.split(",").map((line, index) => (
                        <p key={index} className="mb-1">
                          {line.trim()}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Product Size */}
                  <span className="font-bold text-gray-700">Choose Size:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {data.size?.split(",").map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 border rounded text-sm font-medium transition cursor-pointer
                          ${
                            selectedSize === size
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Color */}
                  {colors.length > 0 && (
                    <div className="mt-4">
                      <span className="font-bold text-gray-700">Choose Color:</span>
                      <div className="flex gap-2 mt-2">
                        {colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={` rounded border-2 transition-all ${
                              selectedColor?.name === color.name
                                ? "border-[#bd7b00] shadow-md"
                                : "border-gray-300"
                            } hover:shadow-sm px-1`}
                            title={color.name}
                            aria-label={`Select color ${color.name}`}
                          >
                            {color.name}
                          </button>
                        ))}
                      </div>
                      {selectedColor && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {selectedColor.name}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 mb-4 lg:mt-0 mt-4">
                    <div className="w-full">
                      {isInCart ? (
                        <button
                          onClick={() => setIsCartOpen(true)}
                          className="bg-[black] text-white font-bold py-2 px-4 rounded-md hover:bg-[#313131] hover:text-white transition duration-300 cursor-pointer w-full"
                        >
                          কার্ট দেখুন
                        </button>
                      ) : (
                        <button
                          onClick={handleAddToCart}
                          className="bg-[#ffffff] text-black border border-gray-300 font-bold py-2 px-4 rounded-md hover:bg-[#313131] hover:text-white transition duration-300 cursor-pointer w-full"
                        >
                          কার্টে রাখুন
                        </button>
                      )}
                    </div>

                    <div className="w-full">
                      <button
                        onClick={handleOrderNow}
                        className="bg-[#DF263A] text-white font-bold py-2 px-4 rounded-md hover:bg-[#b61525] hover:text-white transition duration-300 cursor-pointer w-full"
                      >
                        অর্ডার করুন
                      </button>
                    </div>
                  </div>

                  <div className="w-full flex gap-2">
                    <Link
                      target="_blank"
                      to="https://wa.me/8801607975724"
                      className="w-full bg-[#000000] text-white py-2 px-4 font-bold hover:bg-[#292929] cursor-pointer flex gap-2 justify-center items-center transition-colors rounded"
                    >
                      <IoLogoWhatsapp size={25} /> WhatsApp
                    </Link>
                    <Link
                      target="_blank"
                      to="https://web.facebook.com/messages/t/633689039818544/"
                      className="w-full bg-[#000000] text-white py-2 px-4 font-bold hover:bg-[#292929] cursor-pointer flex gap-2 justify-center items-center transition-colors rounded"
                    >
                      <RiMessengerLine size={25} /> Messenger
                    </Link>
                  </div>
                  <ProductDisclaimerTrust />
                </div>
              </div>

              <div className="lg:py-8 rounded border border-slate-200 bg-white p-4 sm:p-5 shadow-sm mt-5">
                <div className="text-2xl font-bold text-gray-800 border-b border-gray-300">
                  Description
                </div>
                <div className="mt-2 text-gray-700">{data.product_description}</div>
              </div>
            </div>
          </div>

          <RelatedProduct products={relatedProducts} loading={relatedLoading} />
        </div>
      )}

      {/* ✅ IMAGE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-sm font-semibold text-gray-800 line-clamp-1">
                {data?.product_name}
              </div>
              <button
                onClick={closePreview}
                className="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {/* image */}
            <div className="bg-white flex items-center justify-center p-3">
              <img
                src={currentImageSrc}
                alt={data?.product_name}
                className="max-h-[75vh] w-auto object-contain select-none"
              />
            </div>

            {/* hint */}
            <div className="px-4 pb-4 text-xs text-gray-500">
              Tip: press <span className="font-semibold">Esc</span> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Single;