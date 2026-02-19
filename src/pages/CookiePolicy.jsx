import { Cookie, Shield, Sliders, BarChart3, Megaphone, Trash2, RefreshCcw, Mail, Phone, Globe } from "lucide-react";

/**
 * Cookie Policy — Orbin Fashion (JSX + Tailwind)
 * Save as: src/pages/CookiePolicy.jsx
 */

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
      <Cookie className="h-4 w-4" />
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

function Bullets({ items }) {
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

function TableRow({ left, right }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <div className="text-sm font-semibold text-slate-900 sm:col-span-1">{left}</div>
      <div className="text-sm text-slate-600 sm:col-span-2 leading-7">{right}</div>
    </div>
  );
}

export default function CookiePolicy() {
  const LAST_UPDATED = "2026-02-19";

  return (
    <div className="min-h-screen bg-white pt-10 lg:pt-32">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <Pill>COOKIE POLICY</Pill>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Cookie Policy — Orbin Fashion
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          This Cookie Policy explains what cookies are, how we use them, and the choices you have.
          Cookies help our website work properly and improve your shopping experience.
        </p>

        <div className="mt-4 rounded-2xl bg-amber-50/60 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <span className="font-semibold">Last updated:</span> {LAST_UPDATED}
        </div>

        {/* 1 */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Cookie} title="1. What are cookies?" />
          <Card title="Definition">
            Cookies are small text files stored on your device (computer/phone/tablet) when you visit
            a website. They help the website remember actions and preferences (like login, cart items,
            language, etc.) for a better experience.
          </Card>
        </div>

        {/* 2 */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Shield} title="2. Why we use cookies" />
          <Card title="We use cookies to">
            <Bullets
              items={[
                "Enable essential website functions (cart, checkout, security)",
                "Remember your preferences (e.g., location, settings)",
                "Understand how visitors use our site (analytics)",
                "Improve performance, speed, and user experience",
                "Support marketing/ads features if enabled (optional)",
              ]}
            />
          </Card>
        </div>

        {/* 3 */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Sliders} title="3. Types of cookies we may use" />
          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="divide-y divide-slate-200">
              <TableRow
                left="Essential cookies"
                right="Required for basic site functions like cart, checkout, authentication and security. These cookies are usually always enabled."
              />
              <TableRow
                left="Preference cookies"
                right="Remember settings like language or saved preferences to make your next visit easier."
              />
              <TableRow
                left="Analytics cookies"
                right="Help us understand traffic and usage (pages visited, time spent) so we can improve the website."
              />
              <TableRow
                left="Marketing cookies"
                right="Used to show relevant promotions/ads and measure campaign performance (only if marketing tools are enabled)."
              />
            </div>
          </div>
        </div>

        {/* 4 */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={BarChart3} title="4. Analytics & third-party cookies" />
          <Card title="Third-party tools">
            We may use third-party services (such as analytics or marketing providers). These services
            may set their own cookies to collect information about how you use our website.
            <div className="mt-2">
              We do not control third-party cookies directly. Please review the third-party provider’s
              cookie/privacy policies for more details.
            </div>
          </Card>
        </div>

        {/* 5 */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Trash2} title="5. How to manage or disable cookies" />
          <Card title="Your choices">
            You can manage cookies in your browser settings. Most browsers allow you to:
            <Bullets
              items={[
                "View what cookies are stored",
                "Delete cookies",
                "Block cookies for specific sites",
                "Block all cookies",
              ]}
            />
            <div className="mt-3">
              <span className="font-semibold text-slate-900">Note:</span> If you disable essential
              cookies, some features (like cart/checkout) may not work properly.
            </div>
          </Card>
        </div>

        {/* 6 */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={Megaphone} title="6. Cookies and marketing preferences" />
          <Card title="Marketing (if enabled)">
            If marketing cookies are enabled on the website, they may be used to show offers and
            measure performance. You can opt out through your browser settings or through any cookie
            preference banner/tool we provide (if available).
          </Card>
        </div>

        {/* 7 */}
        <div className="mt-10 space-y-4">
          <SectionTitle icon={RefreshCcw} title="7. Updates to this Cookie Policy" />
          <Card title="Changes">
            We may update this Cookie Policy from time to time. When we do, we will update the “Last
            updated” date at the top of this page.
          </Card>
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="text-lg font-bold">Contact us</div>
          <p className="mt-2 text-sm text-white/80">
            If you have questions about our Cookie Policy, contact us:
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
