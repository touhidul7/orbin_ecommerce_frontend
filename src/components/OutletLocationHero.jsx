import React from "react";

/**
 * OutletLocationHero
 * - Same layout as the screenshot: full-width hero with background image,
 *   centered glass card, and a bottom teal strip.
 * - TailwindCSS classes (no imports needed in this environment).
 */
export default function OutletLocationHero({
  backgroundUrl =
    "../../out-let.jpg",
  onView = () => {},
}) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div
        className="relative h-[360px] sm:h-[420px] md:h-[520px] w-full bg-center bg-cover"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
        aria-label="Outlet location background"
        role="img"
      >
        {/* Dim overlay */}
        <div className="absolute inset-0 bg-black/35" />
        {/* Subtle vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/25" />

        {/* Glass card */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div
            className={
              "relative w-full max-w-[980px] rounded-2xl border border-white/15 " +
              "bg-white/10 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
            }
          >
            {/* Inner soft highlight */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />

            <div className="relative flex flex-col items-center justify-center py-10 sm:py-12 md:py-14 text-center">
              <div className="text-xs sm:text-sm tracking-[0.35em] text-white/80">
                FIND OUR
              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
                OUTLET LOCATION
              </h1>

              <button
                type="button"
                onClick={onView}
                className={
                  "mt-6 inline-flex items-center justify-center rounded-xl px-10 py-3 cursor-pointer" +
                  "text-sm font-semibold text-white bg-red-600 " +
                  "shadow-[0_12px_30px_rgba(220,38,38,0.35)] " +
                  "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] " +
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 cursor-pointer"
                }
              >
                OUTLET LOCATION
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom teal strip */}
      {/* <div className="h-16 bg-[#0b3a44]" /> */}
    </section>
  );
}

/**
 * Example usage:
 *
 * <OutletLocationHero
 *   backgroundUrl="/assets/outlet.jpg"
 *   onView={() => console.log('View outlet locations')}
 * />
 */
