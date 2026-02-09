import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/products';

// ✅ change this to your real image base URL path
// Example guesses (pick the correct one for your backend):
// const IMAGE_BASE = "https://api.orbinfashion.com/uploads/products/";
// const IMAGE_BASE = "https://api.orbinfashion.com/public/uploads/";
// If you are unsure, open one product image in browser and copy the folder path.
const IMAGE_BASE = import.meta.env.VITE_API_IMAGE_URL + '/admin/product/'; // keep as base, then append product_image

function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ProductSearch() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedQ = useDebounce(q, 250);
  const navigate = useNavigate();

  // Fetch once
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        const data = await res.json();
        if (!ignore) setProducts(Array.isArray(data?.["0"]) ? data["0"] : []);
      } catch (e) {
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    const text = debouncedQ.trim().toLowerCase();
    if (!text) return [];
    return products
      .filter((p) => {
        const name = (p.product_name || "").toLowerCase();
        const cat = (p.select_category || "").toLowerCase();
        return name.includes(text) || cat.includes(text);
      })
      .slice(0, 8);
  }, [debouncedQ, products]);

  const goSearch = () => {
    const text = q.trim();
    if (!text) return;
    navigate(`/search?q=${encodeURIComponent(text)}`);
    setOpen(false);
  };

  return (
    <div className="relative hidden md:flex w-[320px] lg:w-[380px]">
      {/* icon */}
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#053A47]/70">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") goSearch();
          if (e.key === "Escape") setOpen(false);
        }}
        type="text"
        placeholder="Search products..."
        className="h-10 w-full rounded-full bg-white pl-11 pr-4 text-[13px] text-[#053A47] placeholder:text-[#053A47]/50 outline-none ring-1 ring-white/10 focus:ring-2"
      />

      {/* Suggestions dropdown */}
      {open && q.trim() && (
        <div className="absolute top-[44px] left-0 right-0 z-50 rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-600">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-600">No results</div>
          ) : (
            <div className="max-h-80 overflow-auto">
              {suggestions.map((p) => {
                const slug = slugify(p.product_name);
                const to = `/product/${p.id}/${slug}`; // ✅ like /product/1/watch

                // ✅ build image URL
                const img = p.product_image
                  ? `${IMAGE_BASE}${p.product_image}` // adjust base if needed
                  : "";

                return (
                  <Link
                    key={p.id}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    {/* ✅ Image */}
                    <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                      {img ? (
                        <img
                          src={img}
                          alt={p.product_name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[10px] text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* ✅ Text */}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#053A47] truncate">
                        {p.product_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {p.select_category} • ৳{p.selling_price}
                      </div>
                    </div>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={goSearch}
                className="w-full text-left px-4 py-3 text-sm font-medium text-[#053A47] hover:bg-gray-50 border-t"
              >
                Search for “{q.trim()}”
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
