import { useState } from "react";

const steps = [
  {
    id: 1,
    number: "01",
    color: "#2563eb",
    lightBg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    badgeBg: "#dcfce7",
    badgeColor: "#15803d",
    badgeBorder: "#bbf7d0",
    badgeText: "Save 70%",
    checkBg: "#eff6ff",
    checkBorder: "#bfdbfe",
    checkColor: "#2563eb",
    iconBg: "#2563eb",
    label: "Step 01",
    labelColor: "#2563eb",
    title: "Secure your device today",
    desc: "Purchase a plan and link it to your device in under 2 minutes. Coverage activates instantly.",
    features: [
      "Instant activation — no waiting",
      "Covers all device types",
      "Flexible plan options",
    ],
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 3L4 7v5c0 4.41 3.41 8.54 8 9.93C16.59 20.54 20 16.41 20 12V7L12 3z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    id: 2,
    number: "02",
    color: "#16a34a",
    lightBg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    badgeBg: "#dbeafe",
    badgeColor: "#1d4ed8",
    badgeBorder: "#bfdbfe",
    badgeText: "Zero cost",
    checkBg: "#f0fdf4",
    checkBorder: "#bbf7d0",
    checkColor: "#16a34a",
    iconBg: "#16a34a",
    label: "Step 02",
    labelColor: "#16a34a",
    title: "Use your device worry-free",
    desc: "Total peace of mind from day one — accidental damage & breakdowns covered.",
    features: [
      "Drops, spills & cracks covered",
      "24/7 dedicated support",
      "No hidden service charges",
    ],
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          d="M9 12l2 2 4-4M7 5H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 3,
    number: "03",
    color: "#7c3aed",
    lightBg: "linear-gradient(135deg, #fdf4ff, #f3e8ff)",
    badgeBg: "#fdf4ff",
    badgeColor: "#7c3aed",
    badgeBorder: "#e9d5ff",
    badgeText: "Anytime",
    checkBg: "#fdf4ff",
    checkBorder: "#e9d5ff",
    checkColor: "#7c3aed",
    iconBg: "#7c3aed",
    label: "Step 03",
    labelColor: "#7c3aed",
    title: "Raise a request",
    desc: "Need a fix or upgrade? One tap — we handle pickup, repair & delivery end-to-end.",
    features: [
      "Repair or replacement request",
      "Doorstep pickup & delivery",
      "Live status tracking",
    ],
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const CheckIcon = ({ color }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path
      d="M2 5l2 2.5L8 2.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowConnector = () => (
  <div className="hiw-arrow-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
    <div className="hiw-arrow-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        className="hiw-arrow-line"
        style={{ width: 40, height: 1.5, background: "linear-gradient(90deg, #c7d2fe, #6366f1)" }}
      />
      <svg
        className="hiw-arrow-svg"
        width="14"
        height="14"
        fill="none"
        viewBox="0 0 24 24"
        style={{ marginLeft: 26, marginTop: -8 }}
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
);

export default function HowItWorks() {
  const [active, setActive] = useState(1);

  return (
    <div
      className="hiw-outer"
      style={{
        background: "#f8f9fc",
        padding: "64px 24px 72px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        .hiw-gradient-btn {
          font-size: 17px;
          padding: 1em 2.7em;
          font-weight: bold;
          background: white;
          color: #30a3c2;
          border: none;
          position: relative;
          overflow: hidden;
          border-radius: 0.6em;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.3s ease;
        }
        .hiw-gradient-btn:hover { color: black; }
        .hiw-gradient-btn:active { transform: scale(0.97); }
        .hiw-gradient-btn .hiw-ripple {
          transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
          transition-duration: 500ms;
          transition-property: width, height;
          background-color: #f6d30e;
          border-radius: 9999px;
          width: 0em;
          height: 0em;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: block;
        }
        .hiw-gradient-btn:hover .hiw-ripple {
          width: 14em;
          height: 14em;
        }
        .hiw-gradient-btn .hiw-gradient-layer {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          border-radius: 0.6em;
          margin-top: -0.25em;
          display: block;
        }
        .hiw-gradient-btn .hiw-label {
          position: relative;
          top: -1px;
        }

        /* ── Mobile responsive ── */
        @media (max-width: 639px) {
          .hiw-outer        { padding: 32px 14px 48px !important; }
          .hiw-header       { margin-bottom: 28px !important; }
          .hiw-h2           { font-size: 24px !important; letter-spacing: -0.3px !important; }
          .hiw-subtext      { font-size: 14px !important; }

          /* Cards stack to single column */
          .hiw-cards-grid {
            grid-template-columns: 1fr !important;
            margin-bottom: 24px !important;
          }

          /* Arrow: rotate horizontal → vertical (pointing down) */
          .hiw-arrow-wrap {
            flex-direction: column !important;
            padding-top: 0 !important;
            padding: 6px 0 !important;
            height: 40px !important;
          }
          .hiw-arrow-inner  { flex-direction: column !important; align-items: center !important; }
          .hiw-arrow-line   { width: 1.5px !important; height: 28px !important; background: linear-gradient(180deg, #c7d2fe, #6366f1) !important; }
          .hiw-arrow-svg    { transform: rotate(90deg) !important; margin-left: 0 !important; margin-top: -8px !important; }

          /* Bottom CTA bar: single column */
          .hiw-cta-bar {
            grid-template-columns: 1fr !important;
            padding: 22px 18px !important;
            gap: 18px !important;
          }
          .hiw-cta-title    { font-size: 17px !important; }
          .hiw-cta-sub      { font-size: 13px !important; margin-bottom: 14px !important; }
          .hiw-cta-btns     { min-width: unset !important; flex-direction: row !important; flex-wrap: wrap !important; }
          .hiw-gradient-btn { font-size: 14px !important; padding: 0.75em 1.8em !important; }
          .hiw-view-plans   { font-size: 12px !important; padding: 8px 20px !important; }
        }
      `}</style>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div className="hiw-header" style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "#2563eb",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" fill="#2563eb" />
            </svg>
            How it works
          </div>
          <h2
            className="hiw-h2"
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-1px",
              lineHeight: 1.1,
              marginBottom: 14,
              margin: "0 0 14px",
            }}
          >
            Protected in{" "}
            <span style={{ color: "#2563eb" }}>three simple steps</span>
          </h2>
          <p
            className="hiw-subtext"
            style={{
              fontSize: 16,
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: 440,
              margin: "0 auto",
            }}
          >
            Save up to 70% on device repairs with zero service charges during
            your plan period.
          </p>
        </div>

        {/* Step Cards */}
        <div
          className="hiw-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 48px 1fr 48px 1fr",
            alignItems: "start",
            marginBottom: 40,
          }}
        >
          {steps.map((step, i) => (
            <>
              <div
                key={step.id}
                onClick={() => setActive(step.id)}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${active === step.id ? step.color : "#e2e8f0"}`,
                  borderRadius: 24,
                  overflow: "hidden",
                  cursor: "pointer",
                  transform: active === step.id ? "translateY(-4px)" : "translateY(0)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Card Top */}
                <div style={{ background: step.lightBg, padding: "28px 26px 24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        background: step.iconBg,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.icon}
                    </div>
                    <span
                      style={{
                        background: step.badgeBg,
                        color: step.badgeColor,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "5px 11px",
                        borderRadius: 999,
                        border: `1px solid ${step.badgeBorder}`,
                      }}
                    >
                      {step.badgeText}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: step.labelColor,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                      lineHeight: 1.25,
                      marginBottom: 8,
                    }}
                  >
                    {step.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                    {step.desc}
                  </div>
                </div>

                {/* Card Features */}
                <div
                  style={{
                    padding: "20px 26px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {step.features.map((feat, fi) => (
                    <div
                      key={fi}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 12,
                        color: "#334155",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          background: step.checkBg,
                          border: `1px solid ${step.checkBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CheckIcon color={step.checkColor} />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow between cards */}
              {i < steps.length - 1 && <ArrowConnector key={`arrow-${i}`} />}
            </>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div
          className="hiw-cta-bar"
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 24,
            padding: "36px 40px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div>
            <div
              className="hiw-cta-title"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Ready to protect your device?
            </div>
            <div
              className="hiw-cta-sub"
              style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}
            >
              Join 10,000+ customers who've already saved on repairs and replacements.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  text: "No credit card to explore",
                  icon: (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                },
                {
                  text: "Cancel anytime",
                  icon: (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="2" />
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  text: "4.9 star rated",
                  icon: (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {i > 0 && (
                    <div
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "#cbd5e1",
                        marginRight: 10,
                      }}
                    />
                  )}
                  {item.icon}
                  <span style={{ fontSize: 13, color: "#475569" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hiw-cta-btns" style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 180 }}>
            <button type="button" className="hiw-gradient-btn">
              <span className="hiw-ripple" />
              <span className="hiw-gradient-layer" />
              <span className="hiw-label">Start saving now</span>
            </button>
            <button
              className="hiw-view-plans"
              style={{
                background: "transparent",
                color: "#475569",
                border: "1px solid #e2e8f0",
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 28px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              View plans
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
