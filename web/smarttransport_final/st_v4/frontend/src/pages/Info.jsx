import { useEffect, useState } from "react";

const TARIFS = [
  { ligne:"Antananarivo → Toamasina",  km:357,  tarif:"25 000 Ar", duree:"7–9h",   depart:"06h00" },
  { ligne:"Antananarivo → Fianarantsoa",km:407,  tarif:"20 000 Ar", duree:"8–10h",  depart:"05h30" },
  { ligne:"Antananarivo → Mahajanga",  km:572,  tarif:"35 000 Ar", duree:"11–13h", depart:"05h00" },
  { ligne:"Antananarivo → Toliara",    km:962,  tarif:"45 000 Ar", duree:"14–18h", depart:"04h00" },
  { ligne:"Toamasina → Sambava",       km:520,  tarif:"30 000 Ar", duree:"10–12h", depart:"06h30" },
];

const FAQ = [
  { q:"Comment fonctionne le taxi-brousse à Madagascar ?", r:"Le taxi-brousse part uniquement quand le véhicule est plein ou à l'heure fixée. Il n'y a pas d'horaire fixe garanti — le départ peut varier selon le remplissage. Prévoyez toujours une marge de temps." },
  { q:"Comment payer ?", r:"Le paiement se fait toujours en espèces (Ariary) à bord du véhicule, directement au chauffeur ou à son assistant. Il n'y a pas de paiement en ligne." },
  { q:"Peut-on emporter des bagages ?", r:"Les bagages légers voyagent gratuitement. Les bagages lourds (plus de 15 kg) ou volumineux sont facturés 3 000 Ar par pièce supplémentaire. Les gros sacs et sacs de riz peuvent être chargés sur le toit." },
  { q:"Que faire si le chauffeur refuse ma réservation ?", r:"Il peut y avoir plusieurs raisons : le véhicule est plein, l'heure de départ ne convient pas, ou la destination ne correspond pas à la ligne. Essayez avec un autre taxi-brousse ou une autre date." },
  { q:"Les tarifs sont-ils fixes ?", r:"Les tarifs affichés sont indicatifs. En pratique, ils peuvent légèrement varier selon la saison, l'état des routes et le nombre de passagers. Négociez toujours avant de monter." },
];

// Composant pour animations d'apparition
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setIsVisible(true), delay); return () => clearTimeout(timer); }, [delay]);

  const directions = { up: "translateY(30px)", down: "translateY(-30px)", left: "translateX(-30px)", right: "translateX(30px)", none: "translateY(0)" };
  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translate(0,0)" : directions[direction],
      transition: `opacity 0.6s ease, transform 0.6s ease`,
    }}>{children}</div>
  );
};

// Composant pour cartes animées au hover
const AnimatedCard = ({ children, style = {} }) => (
  <div style={{ ...style, transition: "all 0.3s ease", cursor: "pointer" }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 24px -12px rgba(0,0,0,0.2)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
  >{children}</div>
);

export default function Info({ onNavigate }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => { document.title = "Info — SmartTransport 2035"; }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1rem", display:"flex", flexDirection:"column", minHeight:"100vh" }}>

      {/* HERO */}
      <FadeIn delay={0}>
        <section style={{
          background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(34,211,238,0.1))",
          border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: "1rem",
          padding: "3rem 2.5rem",
          marginBottom: "2rem",
          textAlign: "center",
          position: "relative"
        }}>
          {/* Icône SVG de bus (remplace l'emoji 🚐) */}
          <div style={{ 
            fontSize: "3.5rem", 
            marginBottom: "0.75rem", 
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ color: "#f97316" }}
            >
              <rect x="3" y="8" width="18" height="10" rx="2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
              <path d="M5 13h14" />
              <path d="M3 8h18" />
              <path d="M19 13h2" />
            </svg>
          </div>

          <h1 style={{
            fontSize: "2.2rem", 
            fontWeight: 800, 
            letterSpacing:"-0.03em",
            background: "linear-gradient(135deg, #f97316, #22d3ee)",
            WebkitBackgroundClip:"text", 
            WebkitTextFillColor:"transparent",
            marginBottom:"0.75rem"
          }}>
            Taxi-Brousse Madagascar
          </h1>

          <p style={{ fontSize:"1rem", color:"#888", maxWidth:600, margin:"0 auto 1.5rem", lineHeight:1.7 }}>
            Le taxi-brousse est le principal moyen de transport interurbain à Madagascar.
          </p>

          {onNavigate && (
            <button
              onClick={() => onNavigate("reservation")}
              style={{
                background: "linear-gradient(135deg,#f97316,#22d3ee)", 
                color:"#fff",
                border:"none", 
                borderRadius:40, 
                padding:"0.7rem 1.8rem",
                cursor:"pointer", 
                fontWeight:700, 
                fontSize:"0.9rem", 
                boxShadow:"0 4px 20px rgba(249,115,22,0.35)"
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform="translateY(-2px)"; 
                e.currentTarget.style.boxShadow="0 8px 28px rgba(249,115,22,0.45)"; 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform="translateY(0)"; 
                e.currentTarget.style.boxShadow="0 4px 20px rgba(249,115,22,0.35)"; 
              }}
            >
              Réserver une place →
            </button>
          )}
        </section>
      </FadeIn>

      {/* TARIFS */}
      <FadeIn delay={200}>
        <section style={{ marginBottom:"2rem" }}>
          <h2 style={{ fontSize:"1.25rem", fontWeight:800, marginBottom:"1.1rem" }}>💰 Tarifs indicatifs</h2>
          <div style={{ overflowX:"auto", borderRadius:"1rem" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
              <thead style={{ background:"#222", color:"#ccc" }}>
                <tr>
                  {["Ligne","Distance","Tarif / place","Durée estimée","Départ habituel"].map(h => 
                    <th key={h} style={{ padding:"0.75rem 1rem", textAlign:"left", fontWeight:700, fontSize:"0.75rem" }}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {TARIFS.map((t,i) => (
                  <tr 
                    key={i} 
                    style={{ 
                      background: hoveredRow===i ? "#333" : "#1a1a1a", 
                      transition:"0.2s" 
                    }}
                    onMouseEnter={()=>setHoveredRow(i)} 
                    onMouseLeave={()=>setHoveredRow(null)}
                  >
                    <td style={{ padding:"0.8rem 1rem", fontWeight:600 }}>{t.ligne}</td>
                    <td style={{ padding:"0.8rem 1rem", color:"#888" }}>{t.km} km</td>
                    <td style={{ padding:"0.8rem 1rem", fontWeight:700, color:"#22d3ee" }}>{t.tarif}</td>
                    <td style={{ padding:"0.8rem 1rem", color:"#888" }}>{t.duree}</td>
                    <td style={{ padding:"0.8rem 1rem", color:"#f97316", fontWeight:700 }}>{t.depart}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </FadeIn>

      {/* FAQ */}
      <FadeIn delay={400}>
        <section style={{ marginBottom:"2rem" }}>
          <h2 style={{ fontSize:"1.25rem", fontWeight:800, marginBottom:"1.1rem" }}>❓ Questions fréquentes</h2>
          {FAQ.map((f,i)=>(
            <details key={i} style={{ marginBottom:"0.5rem", background:"#111", borderRadius:"0.75rem", padding:"0.75rem 1rem" }}>
              <summary style={{ cursor:"pointer", fontWeight:700 }}>{f.q}</summary>
              <p style={{ color:"#888", marginTop:"0.5rem", fontSize:"0.85rem" }}>{f.r}</p>
            </details>
          ))}
        </section>
      </FadeIn>

      {/* FOOTER */}
      <footer style={{
        marginTop:"auto", 
        padding:"2rem 1rem", 
        textAlign:"center",
        background:"#0d1117", 
        borderTop:"1px solid #222", 
        borderRadius:"1rem 1rem 0 0"
      }}>
        <p style={{ color:"#888", fontSize:"0.85rem" }}> Lot 123, Antananarivo 101, Madagascar</p>
        <a href="mailto:contact@smarttransport.mg" style={{ color:"#22d3ee", textDecoration:"none", fontWeight:600 }}> contact@smarttransport.mg</a>
        <p style={{ color:"#888", fontSize:"0.75rem", marginTop:"0.5rem" }}>© 2035 SmartTransport. Tous droits réservés.</p>
      </footer>
    </div>
  );
}