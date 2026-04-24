import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// ─── Data ───────────────────────────────────────────────────────────────────
const PLANS = {
  mobile: [
    {
      name: "BuyBack\nGuarantee",
      price: "₹299",
      orig: "₹999",
      knowMore: true,
      benefits: [
        { type: "ring", title: "Guaranteed resale value", body: "Get back up to 70% of your device's purchase price when you sell it back" },
        { type: "gray", icon: "wrench", title: "Accidental Damage Repair Service", bullets: ["Protection for your existing device", "Begins after brand warranty ends", "₹0 service cost on repair"] },
        { type: "blue", icon: "gift", title: "Best Upgrade Offers", body: "Exclusive deals for your next device purchase" },
        { type: "blue", icon: "pct", title: "20% Off Extended Warranty", body: "Save 20% on protection of your next device purchase" },
      ],
    },
    {
      name: "Extend+\nProtection",
      price: "₹299",
      orig: "₹999",
      knowMore: false,
      benefits: [
        { type: "blue", icon: "gavel", title: "Doorstep Device Auction", bullets: ["Auction your device at the best market value", "100+ buyers compete for the best price"] },
        { type: "gray", icon: "wrench", title: "Accidental Damage Repair Service", bullets: ["Begins after brand warranty ends", "₹0 service cost on repair"] },
        { type: "blue", icon: "gift", title: "Best Upgrade Offers", body: "Exclusive deals for your next device purchase" },
        { type: "blue", icon: "pct", title: "20% Off Extended Warranty", body: "Save 20% on protection of your next device purchase" },
      ],
    },
  ],
  laptop: [
    {
      name: "BuyBack\nGuarantee",
      price: "₹399",
      orig: "₹1299",
      knowMore: true,
      benefits: [
        { type: "ring", title: "Guaranteed resale value", body: "Get back up to 70% of your device's purchase price when you sell it back" },
        { type: "gray", icon: "wrench", title: "Accidental Damage Repair Service", bullets: ["Protection for your existing device", "Begins after brand warranty ends", "₹0 service cost on repair"] },
        { type: "blue", icon: "gift", title: "Best Upgrade Offers", body: "Exclusive deals for your next device purchase" },
        { type: "blue", icon: "pct", title: "20% Off Extended Warranty", body: "Save 20% on protection of your next device purchase" },
      ],
    },
    {
      name: "Extend+\nProtection",
      price: "₹399",
      orig: "₹1299",
      knowMore: false,
      benefits: [
        { type: "blue", icon: "gavel", title: "Doorstep Device Auction", bullets: ["Auction your device at the best market value", "100+ buyers compete for the best price"] },
        { type: "gray", icon: "wrench", title: "Accidental Damage Repair Service", bullets: ["Begins after brand warranty ends", "₹0 service cost on repair"] },
        { type: "blue", icon: "gift", title: "Best Upgrade Offers", body: "Exclusive deals for your next device purchase" },
        { type: "blue", icon: "pct", title: "20% Off Extended Warranty", body: "Save 20% on protection of your next device purchase" },
      ],
    },
  ],
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
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
const MobileIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5" />
  </svg>
);
const LaptopIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M0 20h24" />
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
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2.5,
        background: "linear-gradient(90deg,#254696 0%,#6366f1 50%,#254696 100%)",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
        zIndex: 1,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 50% 50%, rgba(37,70,150,.06) 0%, transparent 70%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity .25s ease",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
        {benefit.type === "ring" ? (
          <ProgressRing hovered={hovered} />
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            background: benefit.type === "blue" ? "#eff6ff" : "#f1f5f9",
            border: `1px solid ${benefit.type === "blue" ? "#bfdbfe" : "#e2e8f0"}`,
            transform: hovered ? "scale(1.18) rotate(-6deg)" : "scale(1)",
            transition: "transform .28s cubic-bezier(.34,1.56,.64,1)",
          }}>
            {IconComp && <IconComp />}
          </div>
        )}
        <div style={{
          fontSize: 12, fontWeight: 700,
          color: hovered ? "#254696" : "#1e293b",
          lineHeight: 1.3, flex: 1,
          transition: "color .2s",
          position: "relative", zIndex: 2,
        }}>
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

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  deviceType,
  onKnowMore,
  onExplorePlans,
}: {
  plan: any;
  deviceType: string;
  onKnowMore: (deviceType: string) => void;
  onExplorePlans: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [knowHov, setKnowHov] = useState(false);
  const [exploreHov, setExploreHov] = useState(false);
  const nameLines = plan.name.split("\n");

  return (
    <div
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
        transform: hovered ? "translateY(-8px) scale(1.015)" : "translateY(0) scale(1)",
        transition: "transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease",
      }}
    >
      {/* Card Header */}
      <div style={{
        padding: "26px 26px 22px",
        background: "#254696",
        position: "relative",
        overflow: "hidden",
        minHeight: 148,
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{
          position: "absolute", top: -50, right: -50,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,.07)",
          transform: hovered ? "scale(1.3) translate(-8px,8px)" : "scale(1)",
          transition: "transform .5s ease",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -30,
          width: 150, height: 150, borderRadius: "50%",
          background: "rgba(255,255,255,.04)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%", position: "relative", zIndex: 1, gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: 7 }}>
              Protection Plan
            </div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "40px", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
              {nameLines.map((line: string, i: number) => (
                <span key={i}>{line}{i < nameLines.length - 1 && <br />}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, letterSpacing: ".06em", marginBottom: 4 }}>OFFER</span>
            <span style={{ fontSize: 15, color: "rgba(255,255,255,.35)", textDecoration: "line-through", fontWeight: 500 }}>{plan.orig}</span>
            <span style={{ fontSize: 38, fontWeight: 900, color: "#FFD700", lineHeight: 1, letterSpacing: -1 }}>{plan.price}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "18px 18px 20px", background: "#f8fafd", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {plan.benefits.map((b: any, i: number) => <BenefitTile key={i} benefit={b} />)}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {plan.knowMore ? (
            <>
              <button
                type="button"
                onClick={() => onKnowMore(deviceType)}
                onMouseEnter={() => setKnowHov(true)}
                onMouseLeave={() => setKnowHov(false)}
                style={{
                  flex: 1, padding: "13px 8px", borderRadius: 12,
                  border: "1.5px solid #254696", background: knowHov ? "#eff6ff" : "transparent",
                  color: "#254696", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transform: knowHov ? "translateY(-1px)" : "translateY(0)",
                  boxShadow: knowHov ? "0 4px 12px rgba(37,70,150,.15)" : "none",
                  transition: "all .2s ease",
                }}
              >
                Know More
              </button>
              <button
                type="button"
                onClick={onExplorePlans}
                onMouseEnter={() => setExploreHov(true)}
                onMouseLeave={() => setExploreHov(false)}
                style={{
                  flex: 1, padding: "13px 8px", borderRadius: 12, border: "none",
                  background: exploreHov ? "#1e3a8a" : "#254696",
                  color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: exploreHov ? "0 8px 24px rgba(37,70,150,.4)" : "0 4px 14px rgba(37,70,150,.3)",
                  transform: exploreHov ? "translateY(-2px)" : "translateY(0)",
                  transition: "all .2s ease",
                }}
              >
                Explore Plans
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onExplorePlans}
              onMouseEnter={() => setExploreHov(true)}
              onMouseLeave={() => setExploreHov(false)}
              style={{
                width: "100%", padding: 13, borderRadius: 12, border: "none",
                background: exploreHov ? "#1e3a8a" : "#254696",
                color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                boxShadow: exploreHov ? "0 8px 24px rgba(37,70,150,.4)" : "0 4px 14px rgba(37,70,150,.3)",
                transform: exploreHov ? "translateY(-2px)" : "translateY(0)",
                transition: "all .2s ease",
              }}
            >
              Explore Plans
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BBG Modal ────────────────────────────────────────────────────────────────
function BBGModal({
  slabs,
  onClose,
  onExplore,
}: {
  slabs: any[];
  onClose: () => void;
  onExplore: () => void;
}) {
  const minMonth = slabs.length
    ? Math.min(...slabs.map((s) => parseInt(s.minMonths || s.min_months || "1")))
    : 1;
  const maxMonth = slabs.length
    ? Math.max(...slabs.map((s) => parseInt(s.maxMonths || s.max_months || "36")))
    : 36;

  const [age, setAge] = useState(minMonth);
  const [devicePrice, setDevicePrice] = useState("");

  const currentSlab = slabs.find((s) => {
    const min = parseInt(s.minMonths || s.min_months || "0");
    const max = parseInt(s.maxMonths || s.max_months || "0");
    return age >= min && age <= max;
  }) || slabs[slabs.length - 1];

  const percentage = currentSlab
    ? parseInt(currentSlab.resalePercentage || currentSlab.percentage || "0")
    : 0;

  const progressWidth = maxMonth > minMonth
    ? ((age - minMonth) / (maxMonth - minMonth)) * 100
    : 0;

  const priceNum = parseFloat(devicePrice.replace(/,/g, ""));
  const rupeeValue = !isNaN(priceNum) && priceNum > 0
    ? Math.round((percentage / 100) * priceNum)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 text-white" style={{ background: "#254696" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold">Guaranteed Resale Value</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-white/80">
            See how much you get back based on your device age
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Price input */}
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

          {/* Age display */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Device Age</p>
            <p className="text-3xl font-black" style={{ color: "#254696" }}>
              {age} <span className="text-lg font-semibold">month{age !== 1 ? "s" : ""}</span>
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              aria-label="Device age in months"
              min={minMonth}
              max={maxMonth}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #254696 ${progressWidth}%, #e5e7eb ${progressWidth}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{minMonth}m</span>
              <span>{maxMonth}m</span>
            </div>
          </div>

          {/* Resale % + optional ₹ value */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">You get back</span>
              <div className="text-right">
                <span className="text-2xl font-black" style={{ color: "#254696" }}>
                  {percentage}%
                </span>
                {rupeeValue !== null && (
                  <p className="text-base font-bold text-green-600 leading-tight">
                    ≈ ₹{rupeeValue.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background: "linear-gradient(to right, #254696, #3b82f6)",
                }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              {rupeeValue !== null
                ? `Based on your ₹${priceNum.toLocaleString("en-IN")} device price`
                : "of your device's original purchase price"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); onExplore(); }}
            className="w-full text-white font-bold py-3.5 rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "#254696" }}
          >
            Explore Plans
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PricingSection({ onExplorePlans }: { onExplorePlans?: () => void }) {
  const [view, setView] = useState<"mobile" | "laptop">("mobile");
  const [bbgModal, setBbgModal] = useState<{ deviceType: string; slabs: any[] } | null>(null);

  const { data: allPlans = [] } = useQuery<any[]>({
    queryKey: ["/api/plans"],
    staleTime: 600000,
  });

  const handleKnowMore = (deviceType: string) => {
    const slabs =
      (allPlans as any[]).find(
        (p: any) => p.deviceType === deviceType && p.planType === "bbg"
      )?.claimValueSlabs || [];
    setBbgModal({ deviceType, slabs });
  };

  return (
    <>
      {/* BBG Modal */}
      {bbgModal && (
        <BBGModal
          slabs={bbgModal.slabs}
          onClose={() => setBbgModal(null)}
          onExplore={() => {
            setBbgModal(null);
            onExplorePlans?.();
          }}
        />
      )}

      <div style={{ fontFamily: "'Inter',sans-serif", background: "#eef2f8" }}>

        {/* Section Header */}
        <div style={{ background: "#fff", padding: "28px 32px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, maxWidth: 160, height: 2, background: "#303e58", opacity: 0.2, borderRadius: 999 }} />
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(20px,3.5vw,34px)", fontWeight: 900, color: "#303e58", letterSpacing: "-.5px", margin: 0 }}>
              Plan pricing and coverage
            </h2>
            <div style={{ flex: 1, maxWidth: 160, height: 2, background: "#303e58", opacity: 0.2, borderRadius: 999 }} />
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: 999, padding: 4, border: "1px solid #e2e8f0", gap: 2 }}>
              {([
                { key: "mobile" as const, label: "Mobile Plans", Icon: MobileIcon },
                { key: "laptop" as const, label: "Laptop Plans", Icon: LaptopIcon },
              ]).map(({ key, label, Icon }) => {
                const active = view === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setView(key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "10px 24px", borderRadius: 999, border: "none",
                      fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      background: active ? "#254696" : "transparent",
                      color: active ? "#fff" : "#64748b",
                      boxShadow: active ? "0 2px 10px rgba(37,70,150,.3)" : "none",
                      transition: "all .2s",
                    }}
                  >
                    <Icon />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div style={{
          padding: "40px 32px 52px",
          background: "linear-gradient(145deg,#e8f0fb 0%,#edf3ff 40%,#ede8ff 100%)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(37,70,150,.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, left: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(99,102,241,.04)", pointerEvents: "none" }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
            gap: 28,
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}>
            {PLANS[view].map((plan, i) => (
              <PlanCard
                key={`${view}-${i}`}
                plan={plan}
                deviceType={view}
                onKnowMore={handleKnowMore}
                onExplorePlans={onExplorePlans ?? (() => {})}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
