/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  MapPin,
  Clock,
  Send,
} from "lucide-react";

/**
 * Contact Us (Orbin Fashion) — JSX + Tailwind
 * ✅ UI matches screenshot: top pill + title + subtitle, 3 quick cards, 2-col layout
 * ✅ Form is Web3Forms compatible
 *
 * HOW TO USE WEB3FORMS:
 * - Put your API key in: WEB3FORMS_KEY
 * - This submits to: https://api.web3forms.com/submit
 * - You can add redirect in the payload if you want
 */

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_KEY = ""; // <-- paste your API KEY here

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
      {children}
    </span>
  );
}

function QuickCard({ icon: Icon, title, subtitle, rightText = "›", onClick, href }) {
  const Wrapper = href ? "a" : "button";
  return (
    <Wrapper
      {...(href
        ? { href, target: "_blank", rel: "noreferrer" }
        : { type: "button", onClick })}
      className="group flex w-full items-center justify-between rounded-2xl bg-white p-5 text-left ring-1 ring-slate-200 transition hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
          <Icon className="h-4 w-4 text-slate-900" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-600">{subtitle}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
    </Wrapper>
  );
}

function FieldLabel({ children }) {
  return <label className="text-xs font-medium text-slate-600">{children}</label>;
}

export default function ContactUs() {
  const TOPICS = useMemo(
    () => [
      "Order support",
      "Shipping & delivery",
      "Returns / exchange",
      "Wholesale / corporate",
      "Product query",
      "Other",
    ],
    []
  );

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: TOPICS[0],
    message: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!WEB3FORMS_KEY) {
      setStatus({
        type: "error",
        message: "Web3Forms API key missing. Add it in WEB3FORMS_KEY.",
      });
      return;
    }

    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      // Web3Forms payload
      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: `Orbin Fashion — Contact: ${form.topic}`,
        from_name: "Orbin Fashion Website",
        // Optional: redirect after success
        // redirect: "https://yourdomain.com/thanks",
        name: form.name,
        email: form.email,
        phone: form.phone,
        topic: form.topic,
        message: form.message,
      };

      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.success) {
        setStatus({ type: "success", message: "Message sent ✅ We’ll reply within 1 business day." });
        setForm({
          name: "",
          email: "",
          phone: "",
          topic: TOPICS[0],
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data?.message || "Failed to send. Please try again.",
        });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-10 lg:pt-32">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <Pill>WE&apos;RE HERE TO HELP</Pill>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Contact Orbin Fashion
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Questions about an order, sizing, delivery, or wholesale? Reach out using any option
            below. We usually reply within one business day.
          </p>
        </div>

        {/* Quick cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickCard
            icon={Mail}
            title="Email support"
            subtitle="support@orbin.com.bd"
            href="mailto:support@orbin.com.bd"
          />
          <QuickCard
            icon={Phone}
            title="Call us"
            subtitle="+880 1607-975724"
            href="tel:+8801607975724"
          />
          <QuickCard
            icon={MessageSquare}
            title="Message"
            subtitle="Chat from 10am–6pm (GMT+6)"
            onClick={() => {
              // if you have messenger/whatsapp, add here
              // window.open("https://wa.me/8801607975724", "_blank");
              const el = document.getElementById("contact-form");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>

        {/* Main content */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form (left 2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="text-xl font-bold text-slate-900">Send a message</div>

            <form id="contact-form" onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel>Full name</FieldLabel>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel>Email</FieldLabel>
                  <input
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel>Phone</FieldLabel>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="+880 1X-XXXX-XXXX"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <FieldLabel>Topic</FieldLabel>
                  <select
                    name="topic"
                    value={form.topic}
                    onChange={onChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Message</FieldLabel>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  required
                  rows={5}
                  placeholder="Tell us a bit about how we can help"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Status */}
              {status.message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ring-1 ${
                    status.type === "success"
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      : "bg-rose-50 text-rose-800 ring-rose-200"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Send message"}
                </button>

                <div className="text-xs text-slate-500">
                  We typically reply within 1 business day.
                </div>
              </div>
            </form>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">Store & office</div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-900" />
                  <div>
                    <div>Dhaka, Bangladesh</div>
                    <div className="text-xs text-slate-500">Open Sun–Thu</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-slate-900" />
                  <div>
                    <div>Hours: 10:00–18:00 (GMT+6)</div>
                    <div className="text-xs text-slate-500">Support response within 1 day</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">Order & shipping help</div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Track your order from your account dashboard.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  For address changes, contact us before dispatch.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  Exchange/returns within 7 days (policy applies).
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">Quick links</div>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm">
                <a className="text-slate-700 underline hover:text-slate-900" href="/about">
                  About
                </a>
                <a className="text-slate-700 underline hover:text-slate-900" href="/terms">
                  Terms & Conditions
                </a>
                <a className="text-slate-700 underline hover:text-slate-900" href="/privacy">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-14 text-center text-xs text-slate-500">
          Orbin Fashion — made for everyday confidence
        </div>
      </div>
    </div>
  );
}
