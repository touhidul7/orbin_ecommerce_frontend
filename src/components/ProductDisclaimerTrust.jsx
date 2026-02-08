import React from "react";
import { Info, Truck, ShieldCheck, RotateCcw } from "lucide-react";

/**
 * ProductDisclaimerTrust
 * - Matches screenshot: disclaimer card, viewing count line, and 3 trust icons row.
 * - TailwindCSS only.
 */
export default function ProductDisclaimerTrust({
  title = "Product Disclaimer",
  disclaimer =
    "আলো 2 ও ৩ টাচিং ছবির ডিজাইনে বাস্তবে ছবির সাথে মেলতে না পারার গাইডলাইন হতে পারে তবে পণ্যের রঙের সামান্য পার্থক্য হতে পারে এবং পণ্যের সাইজও সামান্য ভিন্ন হতে পারে।",
  phoneLabel = "জরুরি প্রয়োজনে কল করুন:",
  phone = "+8809647-149449",
//   viewingCount = 47,
}) {
  return (
    <div className="w-full mt-8">
      {/* Disclaimer card */}
      <div className="rounded border border-slate-200 bg-white p-4 sm:p-5 shadow">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white">
            <Info className="h-5 w-5 text-slate-700" />
          </div>

          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">
              {title}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {disclaimer}
            </p>
            <div className="mt-2 text-sm text-slate-700">
              <span className="font-medium">{phoneLabel}</span>{" "}
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="font-semibold text-slate-900 hover:underline"
              >
                {phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Viewing count */}
      {/* <div className="py-4 text-center text-sm text-slate-600">
        <span className="font-semibold text-slate-800">{viewingCount}</span>{" "}
        people are viewing this product
      </div> */}

      {/* Trust row */}
      <div className="grid grid-cols-3 gap-6 sm:gap-10">
        <TrustItem icon={<Truck className="h-6 w-6" />} title="Fast Shipping" />
        <TrustItem
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Secure Payment"
          subtitle="100% Protected"
        />
        <TrustItem icon={<RotateCcw className="h-6 w-6" />} title="Easy Returns" />
      </div>
    </div>
  );
}

function TrustItem({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center rounded border border-slate-200 bg-white p-4 sm:p-5 shadow mt-5">
      <div className="text-slate-700">{icon}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{title}</div>
      {subtitle ? (
        <div className="text-xs text-slate-600">{subtitle}</div>
      ) : null}
    </div>
  );
}

/**
 * Example:
 * <ProductDisclaimerTrust viewingCount={47} phone="+8809647-149449" />
 */
