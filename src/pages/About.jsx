/* eslint-disable no-unused-vars */
import {
  BadgeCheck,
  Briefcase,
  ClipboardCheck,
  Hand,
  Leaf,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  Wrench,
  Globe,
  Scissors,
  Package,
} from "lucide-react";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
      {children}
    </span>
  );
}

function PrimaryButton({ children, href = "#story" }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
    >
      {children}
    </a>
  );
}

function SecondaryButton({ children, href = "#craft" }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
    >
      {children}
    </a>
  );
}

function FeatureTile({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
          <Icon className="h-4 w-4 text-slate-900" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-600">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
          <Icon className="h-4 w-4 text-slate-900" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function ContactPill({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
      <Icon className="h-4 w-4 text-slate-900" />
      <span className="text-sm text-slate-700">{children}</span>
    </div>
  );
}

export default function AboutOrbinFashion() {
  return (
    <div className="min-h-screen bg-white lg:pt-32 pt-10">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left */}
          <div>
            <Pill>STYLE • QUALITY • CONFIDENCE</Pill>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Style that lasts. Confidence that shows.
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Orbin Fashion is more than a fashion brand — it’s a commitment to timeless style,
              premium craftsmanship, and everyday confidence. We design products that combine
              elegance with durability, so you can look sharp and feel confident wherever life takes you.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton href="#story">Our story</PrimaryButton>
              <SecondaryButton href="#craft">Craft & materials</SecondaryButton>
            </div>
          </div>

          {/* Right feature box */}
          <div className="rounded-2xl bg-amber-50/30 p-4 ring-1 ring-amber-200">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FeatureTile
                icon={Briefcase}
                title="Everyday style"
                subtitle="Sophisticated, comfortable, wearable"
              />
              <FeatureTile icon={Hand} title="Careful craftsmanship" subtitle="Attention to detail & finish" />
              <FeatureTile icon={BadgeCheck} title="Built to last" subtitle="Reliable materials & performance" />
              <FeatureTile icon={Leaf} title="Honest value"
                subtitle="Premium feel, without unnecessary markup"
              />
            </div>
          </div>
        </div>

        {/* WHO WE ARE */}
        <div id="story" className="mt-12">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
              <ShieldCheck className="h-4 w-4 text-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Who we are</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <p className="text-sm leading-7 text-slate-600">
              Orbin Fashion was founded with a simple vision: to deliver premium-quality fashion
              accessories that look sophisticated, feel comfortable, and last long — without unnecessary
              markup. We noticed that many customers had to choose between style, quality, and price.
              Our mission became clear: create products that offer all three.
            </p>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">Our philosophy</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Timeless, not trendy
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Durable, not disposable
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Premium, yet accessible
                </li>
              </ul>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Every product we offer is carefully selected or crafted to meet our standards for design,
                material, and performance.
              </p>
            </div>
          </div>
        </div>

        {/* CRAFT & MATERIALS */}
        <div id="craft" className="mt-12">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
              <Scissors className="h-4 w-4 text-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Craft & materials</h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={ClipboardCheck}
              title="Quality commitment"
              desc="Quality isn’t optional — it’s our foundation. Each product is inspected for finishing, reliable materials, comfortable usability, and long-lasting performance."
            />
            <InfoCard
              icon={BadgeCheck}
              title="Materials you can trust"
              desc="We use a combination of genuine leather and premium materials depending on the product — and we clearly mention material details so you know what you’re buying."
            />
            <InfoCard
              icon={Wrench}
              title="Detail-driven craftsmanship"
              desc="From texture and finish to functionality and fit — attention to detail is what sets Orbin Fashion apart."
            />
            <InfoCard
              icon={Package}
              title="Customer-first experience"
              desc="From browsing to delivery and after-sales support, we work to keep your experience smooth, reliable, and enjoyable — improving from customer feedback."
            />
          </div>
        </div>

        {/* WHAT WE OFFER */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
              <Truck className="h-4 w-4 text-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">What we offer</h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InfoCard
              icon={BadgeCheck}
              title="Premium-quality products"
              desc="Selected or crafted to meet strict standards of design, material, and performance."
            />
            <InfoCard
              icon={ShieldCheck}
              title="Authenticity & transparency"
              desc="We clearly state materials and product details — no confusion, no hidden compromises."
            />
            <InfoCard
              icon={Hand}
              title="Reliable support"
              desc="Responsive help before and after purchase — because great brands listen and improve."
            />
          </div>

          <div className="mt-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-900">Our vision</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              To become a trusted fashion brand known for quality, authenticity, and customer satisfaction —
              locally and globally.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Stylish yet practical designs",
                "Excellent value for money",
                "Premium feel, accessible price",
                "Built for everyday confidence",
              ].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900">Contact</h2>
          <p className="mt-2 text-sm text-slate-600">
            Have a question or need help? We’re here for you.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <ContactPill icon={Mail}>support@orbin.com.bd</ContactPill>
            <ContactPill icon={Phone}>(+880) 1607975724</ContactPill>
            <ContactPill icon={Globe}>www.orbin.com.bd</ContactPill>
            <ContactPill icon={Mail}>hello@orbin.com.bd</ContactPill>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4" />
                Business hours
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Saturday – Thursday | 10:00 AM – 8:00 PM
              </p>
              <p className="mt-2 text-sm text-slate-600">
                You can also reach out through our social media channels for updates, offers, and support.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <div className="text-sm font-semibold text-white/90">Orbin Fashion</div>
              <div className="mt-2 text-2xl font-extrabold leading-tight">
                Designed for those who value style with substance.
              </div>
              <div className="mt-4 text-sm text-white/80">
                Style. Quality. Confidence.
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-14 text-center text-sm text-slate-500">
          Orbin Fashion — made for everyday confidence
        </div>
      </div>
    </div>
  );
}
