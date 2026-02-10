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
  brandName = "RBIN",
  description =
    "Step into style with RBIN BD. We offer a curated collection of the finest footwear, blending comfort, quality, and the latest trends for every stride.",
  quickLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Order Tracking", href: "#" },
  ],
  categories = [
    { label: "Sacchi", href: "#" },
    { label: "Loafer", href: "#" },
    { label: "Formal Shoes", href: "#" },
    { label: "Casual Shoes", href: "#" },
    { label: "Cycle Shoes", href: "#" },
    { label: "Half Loafer", href: "#" },
  ],
  address = "আগারগাঁও ৩০ ফিট রোড, লাইফ বিল্ডিং ভবন",
  phone = "+8809647149449",
  email = "RBIN@gmail.com",
  year = 2026,
  devName = "Sadhin Hossain",
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
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#0a4a58]">
                <span className="text-xl font-extrabold text-[#f7c948]">R</span>
              </div>
              <div className="text-2xl font-extrabold text-[black]">
                {brandName}
              </div>
            </div>

            <p className="mt-5 max-w-sm text-lg leading-6 text-black">
              {description}
            </p>

            <div className="mt-7 flex items-center gap-4 text-black">
              <SocialIcon href="#" label="Facebook">
                <Facebook className="h-10 w-10 bg-black text-white p-2 rounded" />
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <Instagram className="h-10 w-10 bg-black text-white p-2 rounded" />
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <Youtube className="h-10 w-10 bg-black text-white p-2 rounded" />
              </SocialIcon>
            </div>
          </div>

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

          {/* Get in touch */}
          <FooterColumn title="Get In Touch">
            <div className="mt-6 space-y-4">
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
            </div>
          </FooterColumn>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-black" />

      {/* Bottom */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Payments */}
          <div>
            <div className="text-lg font-semibold tracking-wide text-[black]">
              SECURE PAYMENTS
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
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
            </div>
          </div>

          {/* Policy + copyright */}
          <div className="flex flex-col gap-4 text-lg text-black lg:items-end">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
            </div>

            <div className="text-xs">
              © {year} <span className="font-semibold text-black">RBIN</span>.
              <span className="ml-1">All rights reserved.</span>
              <span className="mx-2 text-black">|</span>
              <span>
                Designed and Develop by{" "}
                <span className="font-semibold text-black">{devName}</span>
              </span>
            </div>
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
