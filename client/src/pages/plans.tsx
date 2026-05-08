import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Icons ────────────────────────────────────────────────────────────────────
const WrenchIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);
const GiftIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <path d="M12 22V7m0 0H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);
const GavelIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#254696" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 13l6 6-2 2-6-6" />
    <path d="M3 7l5 5-2 2L1 9z" />
    <path d="M9.5 2.5l5 5-7 7-5-5z" />
  </svg>
);
const PctIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const ICON_MAP: Record<string, () => JSX.Element> = {
  wrench: WrenchIcon,
  gift: GiftIcon,
  gavel: GavelIcon,
  pct: PctIcon,
};

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ hovered }: { hovered: boolean }) {
  const r = 14, cx = 17, cy = 17;
  const circ = 2 * Math.PI * r;
  const dash = (70 / 100) * circ;
  return (
    <svg
      width="34" height="34" viewBox="0 0 34 34"
      style={{
        flexShrink: 0,
        transition: "transform .28s cubic-bezier(.34,1.56,.64,1)",
        transform: hovered ? "scale(1.15) rotate(5deg)" : "scale(1)",
      }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#254696" strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 17 17)" />
      <text x="17" y="21" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#254696" fontFamily="Inter,sans-serif">70%</text>
    </svg>
  );
}

// ─── Benefit Tile ─────────────────────────────────────────────────────────────
function BenefitTile({ benefit }: { benefit: any }) {
  const [hovered, setHovered] = useState(false);
  const IconComp = ICON_MAP[benefit.icon];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fdfeff" : "#fff",
        border: `1px solid ${hovered ? "rgba(37,70,150,.3)" : "#eef2f8"}`,
        borderRadius: 16,
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "scale(1.08) translateY(-3px)" : "scale(1) translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(37,70,150,.18),0 2px 8px rgba(15,23,42,.06)" : "none",
        transition: "transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease,border-color .2s ease,background .2s ease",
        zIndex: hovered ? 5 : 1,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: "linear-gradient(90deg,#254696 0%,#6366f1 50%,#254696 100%)", transform: hovered ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform .3s cubic-bezier(.4,0,.2,1)", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(37,70,150,.06) 0%, transparent 70%)", opacity: hovered ? 1 : 0, transition: "opacity .25s ease", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
        {benefit.type === "ring" ? (
          <ProgressRing hovered={hovered} />
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            background: benefit.type === "blue" ? "#eff6ff" : "#f1f5f9",
            border: `1px solid ${benefit.type === "blue" ? "#bfdbfe" : "#e2e8f0"}`,
            transform: hovered ? "scale(1.18) rotate(-6deg)" : "scale(1)",
            transition: "transform .28s cubic-bezier(.34,1.56,.64,1)",
          }}>
            {IconComp && <IconComp />}
          </div>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, color: hovered ? "#254696" : "#1e293b", lineHeight: 1.3, flex: 1, transition: "color .2s", position: "relative", zIndex: 2 }}>
          {benefit.title}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6, position: "relative", zIndex: 2 }}>
        {benefit.bullets
          ? benefit.bullets.map((b: string, i: number) => <p key={i} style={{ marginBottom: 1 }}>• {b}</p>)
          : <p>{benefit.body}</p>
        }
      </div>
    </div>
  );
}

// ─── Claim Value Slabs ────────────────────────────────────────────────────────
const ClaimValueSlabs = ({ slabs }: { slabs: any[] }) => {
  if (!slabs || slabs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <p style={{ color: "#666666" }} className="text-sm text-center">No claim value slabs available</p>
      </div>
    );
  }

  const ordinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const formatAgeRange = (slab: any, isFirst: boolean) => {
    const min = slab.minMonths || slab.min_months;
    const max = slab.maxMonths || slab.max_months;
    if (!min || !max) return slab.deviceAge || slab.ageRange || slab.range || "Unknown";
    const minNum = parseInt(min);
    const maxNum = parseInt(max);
    if (isNaN(minNum) || isNaN(maxNum)) return `${min} to ${max} Month`;
    return (
      <span className={`text-[15px] sm:text-base ${isFirst ? "font-bold text-[#254696]" : "text-[#1F2937]"}`}>
        {minNum}<sup>{ordinalSuffix(minNum)}</sup>{" "}
        <span className={`font-normal ${isFirst ? "text-[#254696]" : "text-gray-600"}`}>to</span>{" "}
        {maxNum}<sup>{ordinalSuffix(maxNum)}</sup> Month
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col pt-2">
      <div className="flex justify-between items-center px-4 mb-2">
        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">DEVICE AGE</span>
        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">YOU GET BACK</span>
      </div>
      <div className="flex flex-col relative w-full">
        {slabs.map((slab, idx) => (
          <div key={idx} className="relative w-full">
            {idx > 0 && <div className="absolute top-0 left-4 right-4 h-[1px] bg-gray-200" />}
            <div className={`flex justify-between items-center px-4 py-3.5 ${idx === 0 ? "bg-[#f0f6fb] rounded-xl shadow-sm" : ""}`}>
              <div>{formatAgeRange(slab, idx === 0)}</div>
              <div className={`text-[15px] sm:text-base ${idx === 0 ? "font-bold text-[#254696]" : "font-medium text-[#1a1a1a]"}`}>
                Get back {slab.resalePercentage || slab.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── BBG Modal ────────────────────────────────────────────────────────────────
function BBGModal({ slabs, planType, onClose }: { slabs: any[]; planType?: "bbg" | "extend"; onClose: () => void }) {
  const isExtend = planType === "extend" || slabs.length === 0;
  const minMonth = slabs.length ? Math.min(...slabs.map((s) => parseInt(s.minMonths || s.min_months || "1"))) : 1;
  const maxMonth = slabs.length ? Math.max(...slabs.map((s) => parseInt(s.maxMonths || s.max_months || "36"))) : 36;
  const [age, setAge] = useState(minMonth);
  const [devicePrice, setDevicePrice] = useState("");

  const currentSlab = slabs.find((s) => {
    const min = parseInt(s.minMonths || s.min_months || "0");
    const max = parseInt(s.maxMonths || s.max_months || "0");
    return age >= min && age <= max;
  }) || slabs[slabs.length - 1];

  const percentage = currentSlab ? parseInt(currentSlab.resalePercentage || currentSlab.percentage || "0") : 0;
  const progressWidth = maxMonth > minMonth ? ((age - minMonth) / (maxMonth - minMonth)) * 100 : 0;
  const priceNum = parseFloat(devicePrice.replace(/,/g, ""));
  const rupeeValue = !isNaN(priceNum) && priceNum > 0 ? Math.round((percentage / 100) * priceNum) : null;

  const EXTEND_HIGHLIGHTS = [
    { icon: "🔨", title: "Doorstep Device Auction", desc: "100+ buyers compete at your doorstep — get the best market value for your old device." },
    { icon: "🔧", title: "Accidental Damage Repair", desc: "₹0 service cost on repairs. Begins after your brand warranty period ends." },
    { icon: "🎁", title: "Best Upgrade Offers", desc: "Exclusive deals and discounts on your next device purchase." },
    { icon: "%", title: "20% Off Extended Warranty", desc: "Save 20% on protection plans for your next device." },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-5 text-white" style={{ background: "#254696" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold">
              {isExtend ? "Extend+ Protection Plan" : "Guaranteed Resale Value"}
            </h3>
            <button type="button" onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          <p className="text-sm text-white/80">
            {isExtend ? "Everything included in your Extend+ plan" : "See how much you get back based on your device age"}
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          {isExtend ? (
            <div className="space-y-3">
              {EXTEND_HIGHLIGHTS.map((item, i) => (
                <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-2xl p-4">
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Device Purchase Price (optional)
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#254696]/30">
                  <span className="px-3 py-3 bg-gray-50 text-gray-500 font-semibold border-r border-gray-200">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={devicePrice}
                    onChange={(e) => setDevicePrice(e.target.value)}
                    className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Device Age</p>
                <p className="text-3xl font-black" style={{ color: "#254696" }}>
                  {age} <span className="text-lg font-semibold">month{age !== 1 ? "s" : ""}</span>
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  aria-label="Device age in months"
                  min={minMonth}
                  max={maxMonth}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #254696 ${progressWidth}%, #e5e7eb ${progressWidth}%)` }}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{minMonth}m</span>
                  <span>{maxMonth}m</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">You get back</span>
                  <div className="text-right">
                    <span className="text-2xl font-black" style={{ color: "#254696" }}>{percentage}%</span>
                    {rupeeValue !== null && (
                      <p className="text-base font-bold text-green-600 leading-tight">
                        ≈ ₹{rupeeValue.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: "linear-gradient(to right, #254696, #3b82f6)" }} />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  {rupeeValue !== null ? `Based on your ₹${priceNum.toLocaleString("en-IN")} device price` : "of your device's original purchase price"}
                </p>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full text-white font-bold py-3.5 rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "#254696" }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan benefits data ───────────────────────────────────────────────────────
const BBG_BENEFITS = [
  { type: "ring", title: "Guaranteed resale value", body: "Get back up to 70% of your device's purchase price when you sell it back" },
  { type: "gray", icon: "wrench", title: "Accidental Damage Repair Service", bullets: ["Protection for your existing device", "Begins after brand warranty ends", "₹0 service cost on repair"] },
  { type: "blue", icon: "gift", title: "Best Upgrade Offers", body: "Exclusive deals for your next device purchase" },
  { type: "blue", icon: "pct", title: "20% Off Extended Warranty", body: "Save 20% on protection of your next device purchase" },
];

const EXTEND_BENEFITS = [
  { type: "blue", icon: "gavel", title: "Doorstep Device Auction", bullets: ["Auction your device at the best market value", "100+ buyers compete for the best price"] },
  { type: "gray", icon: "wrench", title: "Accidental Damage Repair Service", bullets: ["Begins after brand warranty ends", "₹0 service cost on repair"] },
  { type: "blue", icon: "gift", title: "Best Upgrade Offers", body: "Exclusive deals for your next device purchase" },
  { type: "blue", icon: "pct", title: "20% Off Extended Warranty", body: "Save 20% on protection of your next device purchase" },
];

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  planData,
  planType,
  crossedPrice,
  onBuyNow,
  onKnowMore,
  pricesLoading,
  testId,
  buyTestId,
}: {
  planData: any;
  planType: "bbg" | "extend";
  crossedPrice: number;
  onBuyNow: (planData: any) => void;
  onKnowMore?: () => void;
  pricesLoading: boolean;
  testId?: string;
  buyTestId?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [knowHov, setKnowHov] = useState(false);
  const [buyHov, setBuyHov] = useState(false);

  const isBBG = planType === "bbg";
  const planPrice = planData?.planPrice;
  const savings = planPrice ? Math.max(0, crossedPrice - planPrice) : null;
  const nameLines = isBBG ? ["BuyBack", "Guarantee"] : ["Extend+", "Protection"];
  const benefits = isBBG ? BBG_BENEFITS : EXTEND_BENEFITS;

  return (
    <div
      data-testid={testId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(37,70,150,.12)",
        boxShadow: hovered
          ? "0 24px 64px rgba(37,70,150,.18),0 4px 12px rgba(15,23,42,.06)"
          : "0 2px 8px rgba(15,23,42,.05),0 8px 32px rgba(37,70,150,.08)",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease",
      }}
    >
      {/* Header */}
      <div
        className="ps-card-header"
        style={{
          padding: "26px 26px 22px",
          background: "linear-gradient(140deg, #486bcc 0%, #273f74 50%, #0d235f 100%)",
          position: "relative",
          overflow: "hidden",
          minHeight: 148,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.07)", transform: hovered ? "scale(1.3) translate(-8px,8px)" : "scale(1)", transition: "transform .5s ease", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%", position: "relative", zIndex: 1, gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: 7 }}>
              Protection Plan
            </div>
            <div className="ps-plan-name" style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
              {nameLines.map((line, i) => (
                <span key={i}>{line}{i < nameLines.length - 1 && <br />}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, letterSpacing: ".06em", marginBottom: 4 }}>OFFER</span>
            <span style={{ fontSize: 15, color: "rgba(255,255,255,.35)", textDecoration: "line-through", fontWeight: 500 }}>₹{crossedPrice}</span>
            <span className="ps-plan-price" style={{ fontSize: "clamp(28px,5vw,38px)", fontWeight: 900, color: "#FFD700", lineHeight: 1, letterSpacing: -1 }}>
              {pricesLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : `₹${planPrice || "--"}`}
            </span>
            {savings !== null && savings > 0 && !pricesLoading && (
              <span style={{ background: "rgba(74,222,128,0.2)", color: "#4ade80", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginTop: 6 }}>
                You save ₹{savings}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className="ps-card-body"
        style={{ padding: "18px 18px 20px", background: "#f8fafd", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div className="ps-benefits-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {benefits.map((b, i) => <BenefitTile key={i} benefit={b} />)}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          {isBBG && onKnowMore && (
            <button
              type="button"
              onMouseEnter={() => setKnowHov(true)}
              onMouseLeave={() => setKnowHov(false)}
              onClick={onKnowMore}
              style={{
                flex: 1,
                padding: "13px 8px",
                borderRadius: 12,
                border: "1.5px solid #254696",
                background: knowHov ? "#eff6ff" : "transparent",
                color: "#254696",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transform: knowHov ? "translateY(-1px)" : "translateY(0)",
                boxShadow: knowHov ? "0 4px 12px rgba(37,70,150,.15)" : "none",
                transition: "all .2s ease",
              }}
            >
              Know More
            </button>
          )}

          <button
            data-testid={buyTestId}
            type="button"
            onClick={() => onBuyNow(planData)}
            onMouseEnter={() => setBuyHov(true)}
            onMouseLeave={() => setBuyHov(false)}
            disabled={pricesLoading || !planData}
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 12,
              border: "none",
              background: buyHov && !pricesLoading && planData ? "#1e3a8a" : "#254696",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: pricesLoading || !planData ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: buyHov && !pricesLoading && planData ? "0 8px 24px rgba(37,70,150,.4)" : "0 4px 14px rgba(37,70,150,.3)",
              transform: buyHov && !pricesLoading && planData ? "translateY(-2px)" : "translateY(0)",
              transition: "all .2s ease",
              opacity: pricesLoading || !planData ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {pricesLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy Now →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Plans() {
  const [, setLocation] = useLocation();
  const [bbgModal, setBbgModal] = useState<{ slabs: any[]; planType: "bbg" | "extend" } | null>(null);

  let searchParams = new URLSearchParams(window.location.search);
  let deviceType = searchParams.get("type");
  let deviceBrand = searchParams.get("brand");
  let deviceModel = searchParams.get("model");
  let deviceAgeSelection = searchParams.get("age");

  if (!deviceType || !deviceBrand || !deviceAgeSelection) {
    const storedPlan = sessionStorage.getItem("selectedPlan");
    if (storedPlan) {
      try {
        const parsed = JSON.parse(storedPlan);
        if (parsed.plansQuery) {
          const storedParams = new URLSearchParams(parsed.plansQuery);
          deviceType = storedParams.get("type");
          deviceBrand = storedParams.get("brand");
          deviceModel = storedParams.get("model");
          deviceAgeSelection = storedParams.get("age");
          if (deviceType && deviceBrand && deviceAgeSelection) {
            window.history.replaceState({}, "", `/plans${parsed.plansQuery}`);
          }
        }
      } catch {}
    }
  }

  const { data: allPlans = [], isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: async () => {
      const response = await fetch("/api/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      return response.json();
    },
  });

  const getPlanInfo = (planDeviceType: string, planType: string) =>
    allPlans.find((p: any) => p.deviceType === planDeviceType && p.planType === planType);

  const laptopBBGPlan = getPlanInfo("laptop", "bbg");
  const mobileBBGPlan = getPlanInfo("mobile", "bbg");
  const laptopExtendPlan = getPlanInfo("laptop", "extend_plus");
  const mobileExtendPlan = getPlanInfo("mobile", "extend_plus");

  if (!deviceType || !deviceBrand || !deviceAgeSelection) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4" data-testid="heading-no-device">
            No device details found
          </h1>
          <p className="text-gray-600 mb-6" data-testid="text-no-device-desc">
            Please go back and select your device details to view available plans.
          </p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-go-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isWithinSixMonths = deviceAgeSelection === "1";
  const showingLaptop = deviceType?.toLowerCase() === "laptop";
  const showingMobile = deviceType?.toLowerCase() === "mobile";

  const showLaptopBBG = showingLaptop && isWithinSixMonths;
  const showMobileBBG = showingMobile && isWithinSixMonths;
  const showLaptopExtend = showingLaptop && !isWithinSixMonths;
  const showMobileExtend = showingMobile && !isWithinSixMonths;

  const handleBuyNow = (planInfo: any) => {
    if (!planInfo || !planInfo.planPrice || !planInfo.planName) return;
    const selectedPlan = {
      id: planInfo.id,
      planType: planInfo.planType,
      deviceType: planInfo.deviceType,
      price: planInfo.planPrice,
      planName: planInfo.planName,
      validity: planInfo.validity,
      coverage: planInfo.coverage,
      brand: deviceBrand,
      model: deviceModel,
      deviceAgeSelection: deviceAgeSelection,
      plansQuery: window.location.search,
    };
    sessionStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated") === "true";
    if (isAuthenticated) {
      setLocation("/checkout");
    } else {
      setLocation("/customer/login?redirect=/checkout");
    }
  };

  const handleKnowMore = (planData: any, planType: "bbg" | "extend") => {
    setBbgModal({ slabs: planData?.claimValueSlabs || [], planType });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f8", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @media (max-width: 639px) {
          .ps-plan-name   { font-size: 28px !important; }
          .ps-plan-price  { font-size: 28px !important; }
          .ps-card-header { padding: 18px 16px 16px !important; min-height: auto !important; }
          .ps-card-body   { padding: 14px 12px 16px !important; }
          .ps-benefits-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
        }
        .ps-device-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Top nav */}
      <div style={{ borderBottom: "1px solid #e5e7eb", padding: "14px 20px" }}>
        <Link href="/">
          <button
            data-testid="button-back-home"
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#254696", fontWeight: 600, fontSize: 14, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </Link>
      </div>

      {/* Light hero */}
      <div style={{ padding: "12px 20px 0", textAlign: "center", borderBottom: "1px solid #eef2f8" }}>
        <p style={{ color: "#254696", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
          Available Plans for Your Device
        </p>

        {/* Device info chips — wrap on mobile */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {([
            // { value: deviceType.charAt(0).toUpperCase() + deviceType.slice(1), testId: "text-device-type", icon: "device" },
            // { value: deviceBrand, testId: "text-device-brand", icon: null },
            ...(deviceModel ? [{ value: deviceModel, testId: "text-device-model", icon: null }] : []),
            { value: isWithinSixMonths ? "Within 6 months" : "More than 6 months", testId: "text-device-age", icon: "calendar" },
          ] as { value: string; testId: string; icon: string | null }[]).map(({ value, testId, icon }) => (
            <div
              key={testId}
              data-testid={testId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 100,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: "#334155",
                boxShadow: "0 1px 4px rgba(15,23,42,.05)",
                whiteSpace: "nowrap",
              }}
            >
              {icon === "device" && (
                showingMobile ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                )
              )}
              {icon === "calendar" && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )}
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Plan card */}
      <div style={{ padding: "15px 16px 48px", maxWidth: 640, margin: "0 auto" }}>
        {showLaptopBBG && (
          <PlanCard
            planData={laptopBBGPlan}
            planType="bbg"
            crossedPrice={1299}
            onBuyNow={handleBuyNow}
            onKnowMore={() => handleKnowMore(laptopBBGPlan, "bbg")}
            pricesLoading={pricesLoading}
            testId="card-laptop-bbg"
            buyTestId="button-buy-laptop-bbg"
          />
        )}
        {showMobileBBG && (
          <PlanCard
            planData={mobileBBGPlan}
            planType="bbg"
            crossedPrice={999}
            onBuyNow={handleBuyNow}
            onKnowMore={() => handleKnowMore(mobileBBGPlan, "bbg")}
            pricesLoading={pricesLoading}
            testId="card-mobile-bbg"
            buyTestId="button-buy-mobile-bbg"
          />
        )}
        {showLaptopExtend && (
          <PlanCard
            planData={laptopExtendPlan}
            planType="extend"
            crossedPrice={1299}
            onBuyNow={handleBuyNow}
            onKnowMore={() => handleKnowMore(laptopExtendPlan, "extend")}
            pricesLoading={pricesLoading}
            testId="card-laptop-extend"
            buyTestId="button-buy-laptop-extend"
          />
        )}
        {showMobileExtend && (
          <PlanCard
            planData={mobileExtendPlan}
            planType="extend"
            crossedPrice={999}
            onBuyNow={handleBuyNow}
            onKnowMore={() => handleKnowMore(mobileExtendPlan, "extend")}
            pricesLoading={pricesLoading}
            testId="card-mobile-extend"
            buyTestId="button-buy-mobile-extend"
          />
        )}

        {/* Trust row */}
        
      </div>

      {/* BBG Modal */}
      {bbgModal && (
        <BBGModal
          slabs={bbgModal.slabs}
          planType={bbgModal.planType}
          onClose={() => setBbgModal(null)}
        />
      )}
    </div>
  );
}
