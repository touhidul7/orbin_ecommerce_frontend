import React from "react";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  AlertTriangle,
  Copyright,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
      <FileText className="h-4 w-4" />
      {children}
    </span>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
          <Icon className="h-4 w-4 text-slate-900" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 text-sm leading-7 text-slate-600">
        {children}
      </div>
    </div>
  );
}

export default function TermsOfService() {
  const LAST_UPDATED = "2026-02-19";

  return (
    <div className="min-h-screen bg-white pt-10 lg:pt-32">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <Pill>TERMS OF SERVICE</Pill>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Terms of Service — Orbin Fashion
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          These Terms of Service govern your use of our website and the purchase
          of products from Orbin Fashion. By using our website, you agree to
          these terms.
        </p>

        <div className="mt-4 rounded-2xl bg-amber-50/60 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <span className="font-semibold">Last updated:</span> {LAST_UPDATED}
        </div>

        {/* 1 */}
        <div className="mt-10 space-y-8">
          <Section icon={ShieldCheck} title="1. Use of Website">
            You agree to use this website only for lawful purposes.
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>You must not misuse or attempt to disrupt the website.</li>
              <li>You must not use our content without permission.</li>
              <li>You must provide accurate information when placing orders.</li>
            </ul>
          </Section>

          {/* 2 */}
          <Section icon={CreditCard} title="2. Orders & Payments">
            <ul className="list-disc pl-5 space-y-2">
              <li>All prices are listed in Bangladeshi Taka (BDT).</li>
              <li>We reserve the right to cancel suspicious or fraudulent orders.</li>
              <li>Payment methods may include Cash on Delivery (COD) or online payment (if available).</li>
              <li>Orders are confirmed only after verification and dispatch.</li>
            </ul>
          </Section>

          {/* 3 */}
          <Section icon={Truck} title="3. Shipping & Delivery">
            <ul className="list-disc pl-5 space-y-2">
              <li>Delivery times may vary depending on your location.</li>
              <li>We are not responsible for courier delays due to weather or external conditions.</li>
              <li>Please ensure your delivery address and phone number are correct.</li>
            </ul>
          </Section>

          {/* 4 */}
          <Section icon={RotateCcw} title="4. Returns & Exchanges">
            Returns or exchanges may be accepted if:
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>The product is defective.</li>
              <li>You received the wrong item.</li>
              <li>Size issues (within our policy period).</li>
            </ul>
            Products must be unused and in original condition with packaging.
          </Section>

          {/* 5 */}
          <Section icon={AlertTriangle} title="5. Limitation of Liability">
            Orbin Fashion shall not be liable for:
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>Indirect or incidental damages.</li>
              <li>Losses due to misuse of products.</li>
              <li>External service failures (courier, payment provider, etc.).</li>
            </ul>
          </Section>

          {/* 6 */}
          <Section icon={Copyright} title="6. Intellectual Property">
            All website content including logos, images, text, and designs are
            the property of Orbin Fashion and may not be copied or reused
            without permission.
          </Section>

          {/* 7 */}
          <Section icon={FileText} title="7. Changes to Terms">
            We may update these Terms of Service at any time. Changes will be
            posted on this page with the updated date.
          </Section>
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="text-lg font-bold">Contact Us</div>
          <p className="mt-2 text-sm text-white/80">
            If you have questions about these Terms of Service, contact us:
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href="mailto:support@orbin.com.bd"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Mail className="h-4 w-4" />
              support@orbin.com.bd
            </a>

            <a
              href="tel:+8801607975724"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Phone className="h-4 w-4" />
              +880 1607-975724
            </a>

            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Globe className="h-4 w-4" />
              www.orbin.com.bd
            </a>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-slate-500">
          Orbin Fashion — made for everyday confidence
        </div>
      </div>
    </div>
  );
}
