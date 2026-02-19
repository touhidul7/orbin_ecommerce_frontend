import React from "react";
import { Shield, FileText, Cookie, Lock, RefreshCcw, Truck, Mail, Phone, Globe } from "lucide-react";

/**
 * Privacy Policy — Orbin Fashion (JSX + Tailwind)
 * - Clean layout like your other pages (pill + title + sections with cards)
 * - Replace placeholders (email/phone/site) with your real info
 */

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
      <Shield className="h-4 w-4" />
      {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
        <Icon className="h-4 w-4 text-slate-900" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-7 text-slate-600">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="mt-2 space-y-2 text-sm text-slate-600">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-900" />
          <span className="leading-7">{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  const LAST_UPDATED = "2026-02-19"; // change anytime

  return (
    <div className="min-h-screen bg-white pt-10 lg:pt-32">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <Pill>PRIVACY POLICY</Pill>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy — Orbin Fashion
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          This Privacy Policy explains how Orbin Fashion collects, uses, shares, and protects your
          information when you visit our website or purchase from us.
        </p>

        <div className="mt-4 rounded-2xl bg-amber-50/60 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <span className="font-semibold">Last updated:</span> {LAST_UPDATED}
        </div>

        {/* 1) Overview */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={FileText} title="1. Information we collect" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Information you provide">
              <BulletList
                items={[
                  "Name, phone number, email address",
                  "Shipping/billing address",
                  "Order details (items purchased, price, delivery area)",
                  "Messages you send via contact forms, chat, or email",
                ]}
              />
            </Card>

            <Card title="Information collected automatically">
              <BulletList
                items={[
                  "Device and browser information",
                  "IP address and approximate location",
                  "Pages viewed, time spent, clicks (for analytics)",
                  "Cookies and similar technologies (see Cookies section)",
                ]}
              />
            </Card>
          </div>
        </div>

        {/* 2) Use */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Lock} title="2. How we use your information" />

          <Card title="We use your information to">
            <BulletList
              items={[
                "Process and deliver orders (including Cash on Delivery)",
                "Provide customer support and respond to requests",
                "Send order updates (confirmation, shipping, delivery)",
                "Improve our website, products, and user experience",
                "Prevent fraud and keep transactions secure",
              ]}
            />
          </Card>
        </div>

        {/* 3) Sharing */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Truck} title="3. Sharing of information" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Service providers">
              We may share necessary information with trusted partners who help us operate, such as:
              <BulletList
                items={[
                  "Courier / delivery partners (for shipping & delivery)",
                  "Payment providers (if you pay online)",
                  "Analytics tools (to understand site usage)",
                ]}
              />
            </Card>

            <Card title="Legal & safety">
              We may disclose information if required by law, regulation, or to protect our rights,
              customers, or prevent fraud and abuse.
            </Card>
          </div>
        </div>

        {/* 4) Cookies */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Cookie} title="4. Cookies & tracking" />

          <Card title="Cookies">
            Cookies help us remember your preferences, keep your cart working, and understand how
            visitors use our website.
            <BulletList
              items={[
                "Essential cookies: required for website functionality (cart, checkout)",
                "Analytics cookies: help us improve performance and experience",
                "Marketing cookies: may be used if advertising features are enabled",
              ]}
            />
            <div className="mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect
              some parts of the website.
            </div>
          </Card>
        </div>

        {/* 5) Data retention */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={RefreshCcw} title="5. Data retention" />

          <Card title="How long we keep data">
            We keep your information only as long as needed to provide services (orders, support) and
            to meet legal/accounting requirements. When it’s no longer needed, we securely delete or
            anonymize it.
          </Card>
        </div>

        {/* 6) Security */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Shield} title="6. Security" />

          <Card title="How we protect your data">
            We use reasonable administrative, technical, and physical safeguards to protect your
            information. However, no method of transmission over the internet is 100% secure.
          </Card>
        </div>

        {/* 7) Your rights */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={FileText} title="7. Your choices & rights" />

          <Card title="You can request">
            <BulletList
              items={[
                "Access to the personal data we hold about you",
                "Correction of inaccurate information",
                "Deletion of data (where legally allowed)",
                "Help stopping marketing messages (if any)",
              ]}
            />
            <div className="mt-3">
              To make a request, contact us using the details below.
            </div>
          </Card>
        </div>

        {/* 8) Third-party links */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Globe} title="8. Third-party links" />

          <Card title="External websites">
            Our website may contain links to third-party sites (e.g., social media). We are not
            responsible for their privacy practices. Please review their policies separately.
          </Card>
        </div>

        {/* 9) Changes */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={RefreshCcw} title="9. Changes to this policy" />

          <Card title="Updates">
            We may update this Privacy Policy from time to time. When we do, we’ll update the “Last
            updated” date at the top of this page.
          </Card>
        </div>

        {/* Contact */}
        <div className="mt-10 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="text-lg font-bold">Contact us</div>
          <p className="mt-2 text-sm text-white/80">
            If you have questions about this Privacy Policy or your data, reach out:
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
