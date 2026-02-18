import React, { useMemo, useState } from "react";
import {
  HelpCircle,
  Truck,
  Banknote,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  BadgeCheck,
  Droplet,
  Building2,
  Ruler,
  CheckCircle2,
  ChevronDown,
  Mail,
} from "lucide-react";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
      <HelpCircle className="h-4 w-4" />
      {children}
    </span>
  );
}

function TipBar({ children }) {
  return (
    <div className="mt-8 rounded-2xl bg-amber-50/60 ring-1 ring-amber-200 overflow-hidden">
      <div className="px-5 py-4 text-sm text-amber-900">{children}</div>
    </div>
  );
}

function AccordionItem({ item, open, onToggle }) {
  const Icon = item.icon;
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
            <Icon className="h-4 w-4 text-slate-900" />
          </div>
          <div className="text-sm font-semibold text-slate-900">{item.q}</div>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5">
          {Array.isArray(item.a) ? (
            <ul className="mt-1 space-y-2 text-sm text-slate-600">
              {item.a.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  <span className="leading-7">{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-slate-600">{item.a}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const faqs = useMemo(
    () => [
      {
        icon: Truck,
        q: "How long does delivery take within Bangladesh?",
        a: "Standard delivery usually takes 2–5 business days depending on your location. Orders inside major cities typically arrive faster. You’ll receive tracking updates once your order is shipped.",
      },
      {
        icon: Banknote,
        q: "Do you offer Cash on Delivery (COD)?",
        a: "Yes, we offer Cash on Delivery across most areas in Bangladesh for your convenience.",
      },
      {
        icon: CreditCard,
        q: "What payment methods do you accept?",
        a: [
          "Cash on Delivery (COD)",
          "Mobile Banking (bKash, Nagad, Rocket — if available)",
          "Online card payments (if enabled on checkout)",
        ],
      },
      {
        icon: RotateCcw,
        q: "What is your return and exchange policy?",
        a: [
          "The product is defective",
          "You received the wrong item",
          "The size doesn’t fit",
          "Requests must be made within 3–7 days of delivery, and the item must be unused and in original condition with packaging.",
        ],
      },
      {
        icon: ShieldCheck,
        q: "Do products come with a warranty?",
        a: "Selected products may include a limited quality guarantee covering manufacturing defects. Warranty details (if applicable) are mentioned on the product page.",
      },
      {
        icon: BadgeCheck,
        q: "Are all items genuine leather?",
        a: "We offer both genuine leather and premium alternative materials depending on the product. Material details are always clearly stated in each product description for transparency.",
      },
      {
        icon: Droplet,
        q: "How should I care for my leather product?",
        a: [
          "Avoid prolonged exposure to water or moisture",
          "Store in a cool, dry place",
          "Use leather conditioner periodically",
          "Clean gently with a soft cloth",
          "Proper care will significantly extend product life.",
        ],
      },
      {
        icon: Building2,
        q: "Do you offer monogramming or corporate branding?",
        a: "Yes — we provide custom branding and bulk order services for corporate clients, events, and gifts. Please contact us directly for pricing and minimum order quantities.",
      },
      {
        icon: Ruler,
        q: "How do I choose the right size or fit?",
        a: "Each product page includes a size guide or measurement details. If you’re unsure, contact our support team and we’ll help you choose the best fit before ordering.",
      },
      {
        icon: CheckCircle2,
        q: "How do I know my Orbin Fashion product is authentic?",
        a: "Authentic Orbin Fashion products are sold only through our official website and authorized channels. We maintain strict quality control to ensure every item meets our brand standards.",
      },
    ],
    []
  );

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-white pt-10 lg:pt-32">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <Pill>FREQUENTLY ASKED QUESTIONS</Pill>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          FAQ — Orbin Fashion
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Answers to common questions about orders, delivery, returns, materials, sizing, and care.
          If you don’t see what you need, email{" "}
          <a
            className="font-semibold text-slate-900 underline"
            href="mailto:support@orbin.com.bd"
          >
            support@orbin.com.bd
          </a>
          .
        </p>

        <TipBar>
          <span className="font-semibold">Quick tip:</span> Use your order ID when contacting support
          for faster help.
        </TipBar>

        <div className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
          {faqs.map((item, idx) => (
            <AccordionItem
              key={idx}
              item={item}
              open={openIndex === idx}
              onToggle={() => setOpenIndex((p) => (p === idx ? -1 : idx))}
            />
          ))}
        </div>

        {/* Optional “Still need help?” section (from your PDF tip) */}
        <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="text-lg font-bold">Still need help?</div>
          <p className="mt-2 text-sm text-white/80">
            Our team is ready to help you with orders, sizing, delivery, or returns.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:support@orbin.com.bd"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Mail className="h-4 w-4" />
              Email support
            </a>

            {/* If you want WhatsApp, replace the number */}
            <a
              href="https://wa.me/8801607975724"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
