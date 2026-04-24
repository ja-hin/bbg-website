// ResaleValueSection.jsx — Light Theme
// Usage: <ResaleValueSection onStartSaving={() => scrollToForm()} />

const CheckSVG = ({ color = "#16a34a", size = 9 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2.5 3L8 2" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = ({ color = "white", size = 15 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ArrowDown = ({ color, size = 17 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

const ArrowUp = ({ color, size = 17 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const FlowArrow = ({ color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginBottom: 18 }}>
    <div style={{ width: 20, height: 1.5, background: color }} />
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <path d="M1 4.5h7M5 1.5l3 3-3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const PhoneFrameBad = () => (
  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="#fca5a5" strokeWidth="1.5" />
    <line x1="9" y1="8" x2="15" y2="14" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="15" y1="8" x2="9" y2="14" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="9" y1="18" x2="15" y2="18" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const PhoneFrameGood = () => (
  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="#93c5fd" strokeWidth="1.5" />
    <path d="M9 12l2 2 4-4" stroke="#2563eb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="9" y1="18" x2="15" y2="18" stroke="#bfdbfe" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const WalletIcon = ({ strokeColor }) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="13" rx="2" stroke={strokeColor} strokeWidth="1.5" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="13.5" r="2" stroke={strokeColor} strokeWidth="1.3" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function ResaleValueSection({ onStartSaving }) {
  const statSep = <div style={{ width: 1, height: 44, background: "#f1f5f9", flexShrink: 0 }} />;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#f0f4ff",
      padding: "64px 28px 68px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{
        position: "absolute", top: -100, left: -60, width: 480, height: 480,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(219,234,254,0.9) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -80, right: -60, width: 360, height: 360,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(237,233,254,0.7) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* Eyebrow */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", border: "1px solid #e0e7ff",
            padding: "6px 16px", borderRadius: 999,
          }}>
            <div style={{ width: 18, height: 1.5, background: "#c7d2fe" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1" }}>
              BuyBack Guarantee
            </span>
            <div style={{ width: 18, height: 1.5, background: "#c7d2fe" }} />
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: "#0f172a",
            lineHeight: 1.12, letterSpacing: "-0.8px", marginBottom: 12,
          }}>
            Lock in up to{" "}
            <span style={{ color: "#2563eb" }}>70%</span>
            {" "}of your<br />device's resale value
          </h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.65, marginBottom: 10 }}>
            Upgrade anytime without worrying about market price drops.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "9px 18px", background: "#fff",
            border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 44,
            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#eff6ff", border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2" strokeLinecap="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5" />
              </svg>
            </div>
            <span style={{ fontSize: 13.5, color: "#475569" }}>
              <b style={{ color: "#1e293b", fontWeight: 600 }}>Example:</b> iPhone 17 — purchased at ₹82,900
            </span>
          </div>
        </div>

        {/* Compare Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 1fr", alignItems: "stretch", marginBottom: 16 }}>

          {/* BAD PANEL */}
          <div style={{
            borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column",
            background: "#fff", border: "1.5px solid #fecaca",
            boxShadow: "0 4px 24px rgba(239,68,68,0.07)",
          }}>
            <div style={{
              padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  <b style={{ color: "#0f172a" }}>Without</b> BuyBack
                </span>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px",
                borderRadius: 999, background: "#fff5f5", color: "#ef4444", border: "1px solid #fecaca",
              }}>Market risk</div>
            </div>

            <div style={{ padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#fff5f5", border: "1.5px solid #fecaca",
                }}>
                  <PhoneFrameBad />
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500, textAlign: "center", marginTop: 8 }}>Damaged device</div>
              </div>
              <FlowArrow color="#fca5a5" />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 66, height: 66, borderRadius: 16, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 2,
                  background: "#f9fafb", border: "1.5px solid #e5e7eb",
                }}>
                  <WalletIcon strokeColor="#9ca3af" />
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginTop: 2 }}>₹45K</div>
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500, textAlign: "center", marginTop: 8 }}>Low payout</div>
              </div>
            </div>

            <div style={{ padding: "18px 22px 22px", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ef4444", letterSpacing: "-0.5px", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                <ArrowDown color="#ef4444" /> ₹37,900 loss
              </div>
              <div style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.6 }}>
                Normal resale <span style={{ color: "#475569", fontWeight: 600 }}>₹45,000</span> vs bought at ₹82,900<br />
                <span style={{ color: "#ef4444", fontWeight: 500 }}>−45.7% value lost</span>
              </div>
              <div style={{ height: 3, borderRadius: 999, background: "#f1f5f9", marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: "45%", height: "100%", borderRadius: 999, background: "#fca5a5" }} />
              </div>
            </div>
          </div>

          {/* VS column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ flex: 1, width: 1, background: "#e2e8f0" }} />
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: "#fff",
              border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8",
              flexShrink: 0, boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
            }}>VS</div>
            <div style={{ flex: 1, width: 1, background: "#e2e8f0" }} />
          </div>

          {/* GOOD PANEL */}
          <div style={{
            borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column",
            background: "#fff", border: "1.5px solid #93c5fd",
            boxShadow: "0 4px 24px rgba(37,99,235,0.1)", position: "relative",
          }}>
            {/* Top accent bar */}
            <div style={{ height: 3, background: "linear-gradient(90deg,#3b82f6,#6366f1)" }} />

            <div style={{
              padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  <b style={{ color: "#0f172a" }}>With</b> BuyBack
                </span>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                background: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <CheckSVG color="#16a34a" size={9} /> Guaranteed
              </div>
            </div>

            <div style={{ padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#eff6ff", border: "1.5px solid #bfdbfe",
                }}>
                  <PhoneFrameGood />
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500, textAlign: "center", marginTop: 8 }}>Your device</div>
              </div>
              <FlowArrow color="#93c5fd" />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 66, height: 66, borderRadius: 16, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 2,
                  background: "#f0fdf4", border: "1.5px solid #86efac", position: "relative",
                }}>
                  <WalletIcon strokeColor="#4ade80" />
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", marginTop: 2 }}>₹58K</div>
                  <div style={{
                    position: "absolute", top: -7, right: -7, width: 20, height: 20,
                    borderRadius: "50%", background: "#16a34a", border: "2px solid #fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CheckSVG color="white" size={9} />
                  </div>
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500, textAlign: "center", marginTop: 8 }}>Locked value</div>
              </div>
            </div>

            <div style={{ padding: "18px 22px 22px", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#16a34a", letterSpacing: "-0.5px", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                <ArrowUp color="#16a34a" /> ₹13,000 net gain
              </div>
              <div style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.6 }}>
                Guaranteed resale <span style={{ color: "#475569", fontWeight: 600 }}>₹58,000</span> (70% of ₹82,900)<br />
                <span style={{ color: "#16a34a", fontWeight: 500 }}>+28.9% more than market rate</span>
              </div>
              <div style={{ height: 3, borderRadius: 999, background: "#f1f5f9", marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: "70%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#4ade80,#22c55e)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18,
          padding: "22px 24px", display: "flex", alignItems: "center", marginBottom: 28,
          boxShadow: "0 2px 16px rgba(15,23,42,0.06)",
        }}>
          {[
            { value: "₹45,000", color: "#ef4444", label: "Without plan\nresale value" },
            null,
            { value: "₹58,000", color: "#16a34a", label: "Guaranteed resale\nwith BuyBack" },
            null,
            { value: "+₹13,000", color: "#d97706", label: "Extra money\nin your pocket" },
            null,
            { value: "70%", color: "#6366f1", label: "Resale value\nguaranteed" },
          ].map((item, i) =>
            item === null ? (
              <div key={i} style={{ width: 1, height: 44, background: "#f1f5f9", flexShrink: 0 }} />
            ) : (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, padding: i === 0 ? "0 20px 0 4px" : "0 20px" }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, lineHeight: 1.4, whiteSpace: "pre-line" }}>{item.label}</div>
              </div>
            )
          )}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <button
            onClick={onStartSaving}
            style={{
              background: "#2563eb", color: "#fff", border: "none",
              fontSize: 15, fontWeight: 700, padding: "15px 44px", borderRadius: 13,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
              display: "flex", alignItems: "center", gap: 9,
              maxWidth: 300, width: "100%", justifyContent: "center",
              boxShadow: "0 4px 18px rgba(37,99,235,0.3)",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Start saving now <ArrowRight />
          </button>
          <div style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 7 }}>
            <ShieldIcon />
            Enjoy additional benefits worth{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>₹2,000</span>
          </div>
        </div>

      </div>
    </div>
  );
}
