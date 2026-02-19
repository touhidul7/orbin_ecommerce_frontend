import React from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

/**
 * RSLeatherFooter
 * - TailwindCSS + React
 * - Matches screenshot layout: 4 columns + bottom bar with payments and policy links
 * - Slightly improved: better spacing, responsive grid, accessible links, hover states
 */
export default function MainFooter({
  description = "With your trust and confidence, Orbin Fashion delivers premium quality shoes, offering the perfect blend of comfort, style, and durability. We proudly deliver quality products and trusted service across every corner of Bangladesh.",
  quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Order Tracking", href: "/orders" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
  categories = [
    { label: "Sacchi", href: "/category/Sacchi" },
    { label: "Loafer", href: "/category/Loafer" },
    { label: "Formal Shoes", href: "/category/Formal%20Shoes" },
    { label: "Casual Shoes", href: "/category/Casual%20Shoes" },
    { label: "Cycle Shoes", href: "/category/Cycle%20Shoes" },
    { label: "Half Loafer", href: "/category/Half%20Loafer" },
  ],
  showrooms = [
    {
      name: "Bogura",
      address: "Shop #28, Runner Plaza, 4th lift, Bogura Sadar.",
      phone: "(+880) 1336640100",
    },
    {
      name: "Pabna",
      address: "Aurangazeb Road, Khalifa Patti Mosque, Pabna Sadar.",
      phone: "(+880) 1336640101",
    },
    {
      name: "Rajshahi",
      address:
        "Beside of Chilish Restaurant, Shaheb Bazar Zero Point, Rajshahi Sadar",
      phone: "(+880) 1607975724",
    },
    {
      name: "Head Office",
      address: "At the end of Lane 2, Purbo Rasulpur, Kamrangirchar",
      phone: "(+880) 1607975724",
      email: "hello@orbin.com.bd",
    },
  ],
  year = 2026,
  devName = "Spariqo (Internet Marketing Company)",
}) {
  return (
    <footer className="bg-gradient-to-b from-[#FCCCD8] to-[#FFFFFF] text-[black]">
      {/* Top */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              {/* Simple brand mark */}
              <img src="/logo.png" className="w-40" alt="" />
            </div>

            <p className="mt-5 max-w-sm text-lg leading-6 text-black">
              {description}
            </p>

            {/* <div className="mt-7 flex items-center gap-4 text-black">
              <SocialIcon href="#" label="Facebook">
                <Facebook className="h-10 w-10 bg-black text-white p-2 rounded" />
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <Instagram className="h-10 w-10 bg-black text-white p-2 rounded" />
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <Youtube className="h-10 w-10 bg-black text-white p-2 rounded" />
              </SocialIcon>
            </div> */}
          </div>

          {/* Get in touch */}
          <FooterColumn title="Nearest Showroom">
            {showrooms.map((s) => (
              <div key={s.name} className="mb-2">
                <div className="text-lg font-semibold text-black">{s.name}</div>{" "}
                <div className="text-sm text-black">{s.address}</div>{" "}
                <div className="text-sm text-black">{s.phone}</div>
                {s.email && <div className="text-sm text-black">{s.email}</div>}
              </div>
            ))}
            {/* <div className="mt-6 space-y-4">
              <InfoRow
                icon={<MapPin className="h-5 w-5 text-black" />}
                text={address}
              />
              <InfoRow
                icon={<Phone className="h-5 w-5 text-black" />}
                text={phone}
                href={`tel:${phone.replace(/\s+/g, "")}`}
              />
              <InfoRow
                icon={<Mail className="h-5 w-5 text-black" />}
                text={email}
                href={`mailto:${email}`}
              />
            </div> */}
          </FooterColumn>

          {/* Categories */}
          <FooterColumn title="Categories">
            <ul className="mt-6 space-y-3">
              {categories.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="text-lg text-black transition-colors hover:text-black"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>

          {/* Quick links */}
          <FooterColumn title="Quick Links">
            <ul className="mt-6 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-lg text-black transition-colors hover:text-black"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-black" />

      {/* Bottom */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-6  lg:items-center lg:justify-between">
          {/* Policy + copyright */}
          <div className="flex flex-col gap-4 text-lg text-black">
            {/*  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a href="#" className="hover:text-black">
                Privacy Policy
              </a>
              <span className="text-black">|</span>
              <a href="#" className="hover:text-black">
                Terms of Service
              </a>
              <span className="text-black">|</span>
              <a href="#" className="hover:text-black">
                Cookie Policy
              </a>
            </div> */}

            <div className="text-[16px] text-center">
              © {year} <span className="font-semibold text-black"></span>
              <span className="ml-1">
                Orbin Fashion All rights reserved.
              </span>
              <span className="mx-2 text-black">|</span>
              <span>
                Designed and Develop by{" "}
                <a href="https://www.spariqo.com/" target="_blank" className="font-semibold text-black bg-[#FEE4EA]">{devName}</a>
              </span>
            </div>
            <span className="text-center text-[16px]">
              <a target="_blank" href="https://www.spariqo.com/">https://www.spariqo.com/</a>
            </span>
          </div>

          {/* Payments */}
          <div>
            {/* <div className="text-lg font-semibold tracking-wide text-[black]">
              SECURE PAYMENTS
            </div> */}
            {/* <div className="mt-3 flex flex-wrap items-center gap-2">
              {[
                "bKash",
                "Nagad",
                "Visa",
                "Mastercard",
                "AmEx",
                "UnionPay",
                "Rocket",
                "UPay",
                "PayPal",
              ].map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-black bg-black px-2.5 py-1 text-[11px] text-white"
                >
                  {p}
                </span>
              ))}
            </div> */}
            <img src="/public/payment-methods.png" alt="" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <div className="text-lg font-extrabold text-black]">{title}</div>
      <div className="mt-3 h-px w-full bg-black" />
      {children}
    </div>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-lg " +
        "border border-white/15 bg-white/5 text-white/85 " +
        "transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      }
    >
      {children}
    </a>
  );
}

function InfoRow({ icon, text, href }) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#f7c948]">{icon}</div>
      <div className="text-lg leading-6 text-black">{text}</div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-lg p-1 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {content}
      </a>
    );
  }

  return <div className="rounded-lg p-1">{content}</div>;
}
