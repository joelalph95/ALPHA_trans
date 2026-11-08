import { useEffect, useState, useRef } from "react";
import { api } from "../utils/api";
import LogoIcon from "../components/LogoIcon";

const sliderData = [
  { title: "Taxi-Brousse Madagascar", desc: "Réservez votre trajet vers n'importe quelle destination!" },
  { title: "Routes Optimales au recherche", desc: "Obtenir le meuilleur trajet proche de la destination" },
  { title: "Optimisation Remplissage", desc: "Maximisez votre revenu avec Knapsack." },
  { title: "Gestion Perturbations", desc: "averticiment en cas de routes coupées." }
];

export default function Dashboard({ cities, routes, setTab }) {
  const [stats, setStats] = useState(null);
  const [userRole, setUserRole] = useState('Passager');
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);
  const [animateStats, setAnimateStats] = useState({});
  const sliderRef = useRef(null);

  const goToSlide = (index) => {
    setPrevSlide(activeSlide);
    setActiveSlide(index);
  };

  const nextSlide = () => goToSlide((activeSlide + 1) % sliderData.length);
  const prevSlideHandler = () => goToSlide((activeSlide - 1 + sliderData.length) % sliderData.length);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        nextSlide();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, activeSlide]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prevSlideHandler();
      if (e.key === 'ArrowRight') nextSlide();
    };

    slider.addEventListener('keydown', handleKey);
    return () => slider.removeEventListener('keydown', handleKey);
  }, [activeSlide]);

  useEffect(() => {
    Promise.all([
      api.getStats().then((d) => {
        setStats(d.stats);
        triggerStatAnimation('stats');
      }).catch(() => {}),
      api.getMe().then((u) => {
        setUserRole(u.role || 'Passager');
        triggerStatAnimation('role');
      }).catch(() => setUserRole('Passager'))
    ]);
  }, []);

  const triggerStatAnimation = (key) => {
    setAnimateStats(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAnimateStats(prev => ({ ...prev, [key]: false }));
    }, 500);
  };

  const cityCount = cities.length;

  return (
    <div className="dashboard-container">
      <style jsx>{`
        /* Animation keyframes */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            width: 0;
          }
          to {
            width: var(--final-width);
          }
        }

        @keyframes rotateIn {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes timeTick {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Animation classes */
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .pulse-animation {
          animation: pulse 0.4s ease-in-out;
        }

        .scale-animation {
          animation: scaleIn 0.3s ease-out;
        }

        .slide-in {
          animation: slideIn 0.5s ease-out;
        }

        .time-tick {
          animation: timeTick 0.3s ease-out;
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        /* Card styles */
        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .icon-rotate {
          transition: transform 0.3s ease;
        }

        .hover-lift:hover .icon-rotate {
          animation: rotateIn 0.5s ease-out;
        }

        .rotate-icon {
          transition: transform 0.3s ease;
        }

        .clock-card:hover .rotate-icon {
          transform: rotate(15deg);
        }

        .slider-dot {
          transition: all 0.3s ease;
        }

        .slider-dot.active {
          animation: pulse 0.3s ease-out;
        }

        .slider-item {
          transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
        }

        .slider-item.active {
          animation: fadeIn 0.5s ease-out;
        }

        .slider-prev, .slider-next {
          transition: all 0.3s ease;
        }

        .slider-prev:hover, .slider-next:hover {
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        .stats-grid {
          animation: fadeInUp 0.4s ease-out;
        }

        .capacity-bar {
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-value {
          transition: all 0.2s ease;
        }

        .scale-animation .stat-value {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>

      {/* Hero Slider - Taxi-Brousse Photos */}
      <div 
        ref={sliderRef}
        className={`hero-slider ${isHovered ? 'pause' : ''}`}
        role="region" 
        aria-label="Hero slider des fonctionnalités Taxi-Brousse"
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {sliderData.map((slide, index) => (
          <div 
            key={index} 
            className={`slider-item ${
              activeSlide === index ? 'active' : 
              prevSlide === index ? 'prev' : ''
            }`}
            role="group"
            aria-label={`Slide ${index + 1}: ${slide.title}`}
          >
            <img src={`/images/taxi${index + 1}.jpg`} alt={slide.title} className="slider-image" />
            <div className="slider-overlay">
              <div className="slider-title">{slide.title}</div>
              <p>{slide.desc}</p>
            </div>
          </div>
        ))}
        <div className="slider-dots">
          {sliderData.map((_, index) => (
            <div 
              key={index} 
              className={`slider-dot ${activeSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              role="button"
              aria-label={`Aller au slide ${index + 1}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToSlide(index);
                }
              }}
            />
          ))}
        </div>
        <button 
          className="slider-prev" 
          onClick={prevSlideHandler}
          aria-label="Slide précédent"
        >
          ‹
        </button>
        <button 
          className="slider-next" 
          onClick={nextSlide}
          aria-label="Slide suivant"
        >
          ›
        </button>
      </div>

      {/* Welcome + Clock */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", gap: "2rem", minHeight: "120px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div className="fade-in-up" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  Bienvenue sur Madagascar <span style={{ color: "var(--accent)" }}> ULTRA TRANS</span>
                </div>
                <p className="section-sub" style={{ marginBottom: 0, fontSize: "1rem" }}>
                  Bienvenue sur votre tableau de bord _
                  <span className={`tag tag-${userRole === 'driver' ? 'orange' : userRole === 'admin' ? 'cyan' : 'green'} ${animateStats.role ? 'pulse-animation' : ''}`}>
                    {userRole === 'driver' ? 'Chauffeur' : userRole === 'admin' ? 'Admin' : 'Passager'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Clock />
      </div>

      {/* Key Metrics - Focus IHM */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard 
          value={cityCount} 
          label="Villes connectées" 
          icon={<LogoIcon variant="primary" size="1.5rem" />} 
          color="var(--accent)" 
          animate={animateStats.stats}
        />
        <StatCard 
          value={`${stats?.networkHealth ?? 100}%`} 
          label="Santé réseau" 
          icon={<LogoIcon variant="green" size="1.5rem" />} 
          color="var(--accent2)" 
          progress 
          animate={animateStats.stats}
        />
      </div>

      {/* Statistiques détaillées */}
      <div className="stats-grid">
        <StatCard 
          value={stats?.reservationsToday ?? 24} 
          label="Réservations J." 
          icon={<LogoIcon variant="primary" size="1.5rem" />} 
          color="var(--accent2)" 
          animate={animateStats.stats}
        />
        <StatCard 
          value={stats?.revenueToday ?? '15M Ar'} 
          label="CA J." 
          icon={<LogoIcon variant="green" size="1.5rem" />} 
          color="var(--green)" 
          animate={animateStats.stats}
        />
        <StatCard 
          value="< 50ms" 
          label="Temps de calcul" 
          icon={<LogoIcon variant="orange" size="1.5rem" />} 
          color="var(--yellow)" 
          animate={animateStats.stats}
        />
        <StatCard 
          value="A* + KS" 
          label="Algorithmes" 
          icon={<LogoIcon variant="primary" size="1.5rem" />} 
          color="var(--accent)" 
          animate={animateStats.stats}
        />
      </div>

      {/* Info fonctionnalités */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <FeatureCard
          icon={<LogoIcon variant="primary" size="1.75rem" />}
          title="Itinéraire optimal"
          desc="Algorithme A* avec heuristique haversine pour trouver le chemin le plus court entre deux villes."
          tag="A* — Haute priorité"
          tagClass="tag-orange"
        />
        <FeatureCard
          icon={<LogoIcon variant="orange" size="1.75rem" />}
          title="Recalcul dynamique"
          desc="En cas de route coupée ou d'embouteillage, le système recalcule automatiquement un trajet alternatif."
          tag="A* — Haute priorité"
          tagClass="tag-orange"
        />
        <FeatureCard
          icon={<LogoIcon variant="green" size="1.75rem" />}
          title="Optimisation remplissage"
          desc="Algorithme Knapsack 0/1 pour maximiser le revenu en sélectionnant les meilleurs passagers."
          tag="Knapsack — Moyenne"
          tagClass="tag-cyan"
        />
        <FeatureCard
          icon={<LogoIcon variant="orange" size="1.75rem" />}
          title="Comparaison performances"
          desc="Compare la méthode baseline (BFS naïf) avec la solution A* optimisée sur distance, temps et carburant."
          tag="Analyse — Moyenne"
          tagClass="tag-green"
        />
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, color, progress = false, animate = false }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (animate && value !== prevValue.current) {
      // Animation de comptage
      let start = 0;
      let end = typeof value === 'number' ? value : parseInt(value) || 0;
      if (typeof value === 'string' && value.includes('%')) {
        end = parseInt(value);
      }
      
      const duration = 500;
      const step = Math.ceil(end / (duration / 16));
      let current = start;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= end) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          if (typeof value === 'string' && value.includes('%')) {
            setDisplayValue(`${current}%`);
          } else if (typeof value === 'number') {
            setDisplayValue(current);
          } else {
            setDisplayValue(value);
          }
        }
      }, 16);
      
      prevValue.current = value;
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);

  return (
    <div className={`stat-card ${animate ? 'scale-animation' : ''}`} style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-lg)",
      padding: "1rem",
      textAlign: "center",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div className="icon-wrapper" style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>
        {icon}
      </div>
      <div className="stat-value" style={{ color, fontSize: "1.75rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{displayValue}</div>
      <div className="stat-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</div>
      {progress && (
        <div className="capacity-bar-wrap" style={{ marginTop: "0.5rem", height: "8px", background: "var(--bg-input)", borderRadius: "4px", overflow: "hidden" }}>
          <div 
            className={`capacity-bar ${animate ? 'slide-in' : ''}`} 
            style={{ 
              width: `${parseInt(displayValue) || 100}%`, 
              height: "100%", 
              backgroundColor: color, 
              borderRadius: "4px"
            }} 
          />
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, desc, tag, tagClass }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`card hover-lift ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer"
      }}
    >
      <div className="icon-rotate" style={{ fontSize: "1.75rem", marginBottom: "0.6rem" }}>
        {icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{title}</div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineHeight: 1.5 }}>{desc}</p>
      <span className={`tag ${tagClass} shimmer`} style={{
        display: "inline-block",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.7rem",
        fontWeight: 600
      }}>{tag}</span>
    </div>
  );
}

function Clock() {
  const [currentTime, setCurrentTime] = useState('');
  const [cityLocation, setCityLocation] = useState('Chargement...');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleString('fr-FR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateStr = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Animation sur chaque changement de seconde
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
      
      setCurrentTime(timeStr);
      setDate(dateStr);
    };

    // Get approximate city from geolocation (fallback to Antananarivo)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          let city = 'Antananarivo';
          if (latitude > -15 && longitude > 49) city = 'Toamasina';
          else if (latitude < -20 && longitude > 44) city = 'Toliara';
          else if (latitude < -18 && longitude < 47) city = 'Fianarantsoa';
          setCityLocation(city);
        },
        () => setCityLocation('Antananarivo'),
        { timeout: 5000 }
      );
    } else {
      setCityLocation('Antananarivo');
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [date, setDate] = useState('');

  return (
    <div className={`clock-card ${animate ? 'time-tick' : ''}`} style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-lg)",
      padding: "1rem",
      textAlign: "center",
      minWidth: "180px",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div className="clock-icon rotate-icon" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🕐</div>
      <div className="clock-time" style={{ fontSize: "1.5rem", fontWeight: "bold", fontFamily: "monospace" }}>{currentTime || '...'}</div>
      <div className="clock-date" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{date || '...'}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.25rem', fontWeight: 600 }}>
         {cityLocation}
      </div>
    </div>
  );
}