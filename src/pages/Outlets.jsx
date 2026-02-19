import React, { useMemo, useState } from "react";
import { MapPin, ChevronLeft, ChevronRight, Store } from "lucide-react";

/**
 * Orbin Fashion — Outlets Page (JSX + Tailwind)
 * - Layout similar to your screenshot
 * - Each outlet card has: title, address, phone (optional), "ম্যাপে দেখুন" button
 * - Bottom of each card: image slider (per location)
 *
 * How to use:
 * 1) Put this file as: src/pages/Outlets.jsx (or any component)
 * 2) Ensure Tailwind is set up
 * 3) Replace outlets data with your API data if needed
 */

const sampleOutlets = [
  {
    id: 1,
    name: "Bogura",
    addressLabel: "ঠিকানা",
    address: "Shop #28, Runner Plaza, 4th lift, Bogura Sadar.",
    city: "Bogura",
    district: "Bogura",
    phone: "(+880) 1336640100",
    mapUrl: "https://maps.app.goo.gl/J1ax8pQ4kFkyTLeeA",
    images: [
      "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=70",
    ],
  },
  {
    id: 2,
    name: "Pabna",
    addressLabel: "ঠিকানা",
    address: "Aurangazeb Road, Khalifa Patti Mosque, Pabna Sadar.",
    city: "Pabna",
    district: "Pabna",
    phone: "(+880) 1336640101",
    mapUrl: "https://maps.app.goo.gl/EcouEsv5aGzPBF1N9",
    images: [
      "https://images.unsplash.com/photo-1555529669-2269763671c0?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1200&q=70",
    ],
  },
  {
    id: 3,
    name: "Rajshahi",
    addressLabel: "ঠিকানা",
    address: "Beside of Chilish Restaurant, Shaheb Bazar Zero Point, Rajshahi Sadar",
    city: "Rajshahi",
    district: "Rajshahi",
    phone: "(+880) 1607975724",
    mapUrl: "https://maps.app.goo.gl/SFi9SyQrizvHd7eE6",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=70",
    ],
  },
  {
    id: 4,
    name: "Head Office",
    addressLabel: "ঠিকানা",
    address: "At the end of Lane 2, Purbo Rasulpur, Kamrangirchar",
    city: "Dha  ka",
    district: "Dhaka",
    phone: "(+880) 1607975724",
    email: "hello@orbin.com.bd",
    mapUrl: "https://maps.app.goo.gl/M9db34fNcF84J3qD6",
    images: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=70",
    ],
  },
];

function ImageSlider({ images = [], alt = "Outlet image" }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [idx, setIdx] = useState(0);

  const hasMany = safeImages.length > 1;
  const current = safeImages[idx] || "";

  const prev = () =>
    setIdx((p) => (p - 1 + safeImages.length) % safeImages.length);
  const next = () => setIdx((p) => (p + 1) % safeImages.length);

  if (!safeImages.length) return null;

  return (
    <div className="mt-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <div className="aspect-[16/9] w-full">
          <img src={current} alt={alt} className="h-full w-full object-cover" />
        </div>

        {hasMany && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {hasMany && (
        <div className="mt-2 flex items-center justify-center gap-2">
          {safeImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-2 w-2 rounded-full transition ${
                i === idx ? "bg-slate-900" : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OutletCard({ outlet }) {
  return (
    <div className="rounded-2xl border flex flex-col justify-between border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{outlet.name}</h3>

          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">
                {outlet.addressLabel || "ঠিকানা"}:
              </span>{" "}
              {outlet.address}
            </p>
            <p className="text-slate-600">
              {outlet.city}
              {outlet.district ? `, ${outlet.district}` : ""}
            </p>

            {outlet.phone ? (
              <p>
                <span className="font-semibold text-slate-900">যোগাযোগ:</span>{" "}
                {outlet.phone}
              </p>
            ) : null}
            {outlet.email ? (
              <p>
                <span className="font-semibold text-slate-900">ইমেইল:</span>{" "}
                {outlet.email}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-1 rounded-xl bg-slate-50 p-2 text-slate-700">
          <Store className="h-5 w-5" />
        </div>
      </div>
      <div>
        <div className="mt-4">
          <a
            href={outlet.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <MapPin className="h-4 w-4" />
            ম্যাপে দেখুন
          </a>
        </div>
        {/* ✅ Slider at bottom of each card */}
        <ImageSlider images={outlet.images} alt={`${outlet.name} outlet`} />
      </div>
    </div>
  );
}

export default function Outlets() {
  const outlets = useMemo(() => sampleOutlets, []);

  return (
    <div className="min-h-screen bg-white lg:pt-32 pt-10">
      {/* Top spacing to mimic your screenshot page */}
      <div className="px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Small pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
              <Store className="h-4 w-4" />
              আমাদের সারাদেশজুড়ে উপস্থিতি
            </div>
          </div>

          {/* Hero title */}
          <h1 className="mt-6 text-center text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            আপনার কাছেই আমাদের লোকেশন —
            <br className="hidden sm:block" />
            কেনাকাটা ও সাপ্লাই এখন আরও সহজ
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-6 text-slate-600 sm:text-base">
            Orbin Fashion আউটলেট ও অংশীদার ওয়্যারহাউস নেটওয়ার্কের মাধ্যমে দ্রুত
            ডেলিভারি, সহজ রিটার্ন এবং ধারাবাহিক স্টক নিশ্চিত করি। নিচে থেকে
            আপনার সুবিধাজনক লোকেশনটি বেছে নিন।
          </p>

          {/* Grid */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {outlets.map((outlet) => (
              <OutletCard key={outlet.id} outlet={outlet} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
