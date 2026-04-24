import { useState } from "react";
import IMG1 from "../../../attached_assets/111.png"
import IMG2 from "../../../attached_assets/222.png"


export default function BuyBackSection({setShowCompareModal}) {
  const [hovered, setHovered] = useState(null); // "bad" | "good" | null

  const s = {
    section: {
      background: "#090929",
      padding: "40px 28px 80px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    },
    gridBg: {
      position: "absolute", inset: 0,
      backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",
      backgroundSize: "48px 48px", pointerEvents: "none",
    },
    inner: { maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 },
    head: { textAlign: "center", marginBottom: 52 },
    eyebrow: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(255,215,0,.15)", border: "1.5px solid rgba(255,215,0,.45)",
      borderRadius: 999, padding: "8px 22px", marginBottom: 22,
      boxShadow: "0 0 18px rgba(255,215,0,.18)",
    },
    eDot: { width: 9, height: 9, borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 8px #FFD700" },
    eText: { fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FFD700" },
    headline: {
      fontSize: "clamp(32px,5vw,58px)", fontWeight: 900, color: "#fff", lineHeight: 1.1,
      letterSpacing: "-.8px", margin: "0 0 16px",
      textShadow: "0 0 40px rgba(255,215,0,.25), 0 2px 20px rgba(0,0,0,.4)",
    },
    em: { fontStyle: "normal", color: "#FFD700", textShadow: "0 0 20px rgba(255,215,0,.6)" },
    subline: { fontSize: 17, color: "rgba(255,255,255,.82)", lineHeight: 1.7, margin: "0 0 18px", fontWeight: 500 },
    examplePill: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)",
      borderRadius: 12, padding: "8px 18px", fontSize: 13, color: "white",
    },
    compare: { display: "grid", gridTemplateColumns: "1fr 56px 1fr", alignItems: "stretch", marginBottom: 20 },
    card: (isHovered) => ({
      borderRadius: 24, overflow: "hidden", position: "relative",
      minHeight: 420, border: "1.5px solid rgba(255,255,255,.18)",
      transform: isHovered ? "translateY(-6px)" : "translateY(0)",
      boxShadow: isHovered ? "0 24px 60px rgba(0,0,0,.3)" : "none",
      transition: "transform .3s ease,box-shadow .3s ease",
      cursor: "pointer",
    }),
    cardBg: (src, isHovered) => ({
      position: "absolute", inset: 0,
      backgroundImage: `url(${src})`,
      backgroundSize: "cover", backgroundPosition: "center",
      transition: "transform .4s ease",
      transform: isHovered ? "scale(1.05)" : "scale(1)",
    }),
    overlay: {
      position: "absolute", inset: 0,
      background: "rgba(0,0,0,0.25)",
      pointerEvents: "none",
    },
    accentBad: { height: 4, position: "relative", zIndex: 3, flexShrink: 0, background: "#ef4444" },
    accentGood: { height: 4, position: "relative", zIndex: 3, flexShrink: 0, background: "#22c55e" },
    content: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", flex: 1, height: "100%" },
    top: { padding: "16px 20px 0", display: "flex", alignItems: "start", justifyContent: "space-between" },
    label: { display: "flex",flexDirection: "column", alignItems: "start", gap: 8, fontSize: 30, fontWeight: 700, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,.7)" },
    dotRed: { width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,.8)", flexShrink: 0, marginTop: 8, },
    dotGreen: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,.8)", flexShrink: 0, marginTop: 8, },
    fle: { width: "36%", display: "flex", flexDirection: "column", alignItems: 'end', gap: '60px'},
    badge: { fontSize: 15, fontWeight: 700, padding: "4px 11px", borderRadius: 999, background: "rgba(0,0,0,.35)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", backdropFilter: "blur(6px)", letterSpacing: "0.04em", display:'flex', gap:5, width:"79%" },
    spacer: { flex: 1 },
    bottom: { padding: "18px 20px 22px" },
    bigNum: { fontSize: 26, fontWeight: 900, letterSpacing: "-.4px", color: "#fff", display: "flex", alignItems: "center", gap: 8, marginBottom: 6, textShadow: "0 2px 10px rgba(0,0,0,.6)" },
    subText: { fontSize: 12, color: "rgba(255,255,255,.75)", lineHeight: 1.65, textShadow: "0 1px 6px rgba(0,0,0,.6)" },
    barTrack: { height: 3, borderRadius: 999, background: "rgba(255,255,255,.2)", marginTop: 10, overflow: "hidden" },
    barBad: { height: "100%", width: "45%", background: "#ef4444", borderRadius: 999 },
    barGood: { height: "100%", width: "70%", background: "#22c55e", borderRadius: 999 },
    vsCol: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
    vsLine: { flex: 1, width: 1, background: "rgba(255,255,255,.15)" },
    vsCircle: {
      width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
    },
    stats: {
      display: "flex", alignItems: "center", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)",
      borderRadius: 18, overflow: "hidden", marginBottom: 28, backdropFilter: "blur(10px)",
    },
    stat: { flex: 1, padding: "18px 20px" },
    statVal: { fontSize: 21, fontWeight: 900, color: "#fff", marginBottom: 4, letterSpacing: "-.4px" },
    statLbl: { fontSize: 11, color: "rgba(255,255,255,.55)", fontWeight: 500, lineHeight: 1.5 },
    statSep: { width: 1, background: "rgba(255,255,255,.15)", alignSelf: "stretch" },
    cta: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
    ctaBtn: {
      display: "inline-flex", alignItems: "center", gap: 9,
      background: "#fff", color: "#1e40af", border: "none", fontFamily: "inherit",
      fontSize: 15, fontWeight: 700, padding: "15px 46px", borderRadius: 13, cursor: "pointer",
      boxShadow: "0 4px 20px rgba(0,0,0,.2)", transition: "transform .15s,box-shadow .15s",
    },
    ctaNote: { fontSize: 12.5, color: "rgba(255,255,255,.45)", display: "flex", alignItems: "center", gap: 7 },
  };

  return (
    <section style={s.section}>
      <style>{`
        /* Spinning gradient border wrapper */
        .bbg-btn-outer {
          position: relative;
          display: inline-block;
          padding: 2.5px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 0 35px rgba(255,215,0,0.25), 0 12px 40px rgba(0,0,0,0.5);
          transition: box-shadow 0.4s ease;
        }
        .bbg-btn-outer::before {
          content: '';
          position: absolute;
          inset: -110%;
          background: conic-gradient(from 0deg, #FFD700, #fff8, #3b82f6, #FFD700, #fff8, #FFD700);
          animation: bbgSpin 3s linear infinite;
          z-index: 0;
        }
        @keyframes bbgSpin { to { transform: rotate(360deg); } }
        .bbg-btn-outer:hover {
          box-shadow: 0 0 60px rgba(255,215,0,0.6), 0 18px 50px rgba(0,0,0,0.55);
        }

        /* Inner button */
        .bbg-cta-btn {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #0d1a4a 0%, #162460 100%);
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 16px;
          font-weight: 800;
          padding: 17px 52px;
          border-radius: 15px;
          cursor: pointer;
          overflow: hidden;
          letter-spacing: 0.05em;
          transition: background 0.35s ease, transform 0.3s ease;
          white-space: nowrap;
        }
        /* Light sweep */
        .bbg-cta-btn::before {
          content: '';
          position: absolute;
          top: -50%; left: -80%;
          width: 40%;
          height: 200%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: skewX(-15deg);
          animation: bbgShine 2.6s ease-in-out infinite;
        }
        @keyframes bbgShine {
          0%, 100% { left: -80%; }
          55%       { left: 140%; }
        }
        .bbg-cta-btn:hover {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          transform: translateY(-3px);
        }
        .bbg-cta-btn:active { transform: scale(0.96) translateY(0); }

        /* Spring arrow */
        .bbg-cta-btn .bbg-arrow {
          flex-shrink: 0;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .bbg-cta-btn:hover .bbg-arrow { transform: translateX(9px); }
      `}</style>
      <div style={s.gridBg} />
      <div style={s.inner}>

        <div style={s.head}>
          <div style={s.eyebrow}>
            <div style={s.eDot} />
            <span style={s.eText}>BuyBack Guarantee</span>
          </div>
          <h2 style={s.headline}>
            Lock in up to <span style={s.em}>70%</span> of your<br />device&apos;s resale value
          </h2>
          <p style={s.subline}>Upgrade anytime without worrying about market price drops.</p>
          {/* <div style={s.examplePill}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
            <b style={{color:"#fff"}}>Example:</b>&nbsp;iPhone 17 — purchased at ₹82,900
          </div> */}
        </div>

        <div style={s.compare}>

          {/* WITHOUT */}
          <div style={s.card(hovered === "bad")} onMouseEnter={()=>setHovered("bad")} onMouseLeave={()=>setHovered(null)}>
            <div style={s.cardBg(IMG1, hovered === "bad")} />
            <div style={s.overlay} />
            <div style={s.content}>
              <div style={s.top}>
                <div style={s.label}>
                  <span><b>Without</b> <br/> BuyBack Guarantee</span>
                  <span style={s.examplePill}>iPhone 17 — purchased at ₹82,900</span>
                </div>
                <div style={s.fle}>
                <div style={s.badge}><div style={s.dotRed} /><span> Market risk </span></div>
                <div style={s.bigNum}>
                  Resale Value ₹45,000
                </div></div>
              </div>
              <div style={s.spacer} />
              <div style={s.bottom}>
                
                <div style={s.barTrack}><div style={s.barBad} /></div>
              </div>
            </div>
          </div>

          {/* VS */}
          <div style={s.vsCol}>
            <div style={s.vsLine} />
            <div style={s.vsCircle}>VS</div>
            <div style={s.vsLine} />
          </div>

          {/* WITH */}
          <div style={s.card(hovered === "good")} onMouseEnter={()=>setHovered("good")} onMouseLeave={()=>setHovered(null)}>
            <div style={s.cardBg(IMG2, hovered === "good")} />
            <div style={s.overlay} />
            <div style={s.content}>
              <div style={s.top}>
                <div style={s.label}>
                  <span><b>With</b><br/> BuyBack Guarantee</span>
                  <span style={s.examplePill}>iPhone 17 — purchased at ₹82,900</span>

                </div>
                {/* <div style={s.badge}><div style={s.dotGreen} /><span> Guaranteed </span></div> */}
                <div style={s.fle}>
                <div style={s.badge}><div style={s.dotGreen} /><span> Guaranteed </span></div>
                <div style={s.bigNum}>
                  Resale Value ₹58,000
                </div></div>
              </div>
              <div style={s.spacer} />
              <div style={s.bottom}>
                <div style={s.bigNum}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  Net Benefit: +₹13,000
                </div>
                <div style={s.barTrack}><div style={s.barGood} /></div>
              </div>
            </div>
          </div>

        </div>


        <div style={s.cta}>
          <div className="bbg-btn-outer">
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="bbg-cta-btn"
            >
              Compare now
              <svg className="bbg-arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div style={s.ctaNote}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Enjoy additional benefits worth ₹2,000
          </div>
        </div>

      </div>
    </section>
  );
}
