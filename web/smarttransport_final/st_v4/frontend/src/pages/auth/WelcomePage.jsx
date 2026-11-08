import { useState, useEffect, useCallback, memo } from "react";
import "./welcomePage.css";

const ROLE_PREVIEWS = {
  passenger: {
    icon: "🚗",
    title: "Réservez vos trajets",
    desc: "Trouvez les meilleurs itinéraires optimisés avec nos algorithmes avancés.",
    features: ["Recherche avancée", "Tarifs dynamiques", "Trajets partagés"]
  },
  driver: {
    icon: "🚐",
    title: "Gérez votre activité",
    desc: "Dashboard chauffeur pour réservations, routes et optimisation knapsack.",
    features: ["Planning hebdomadaire", "Statistiques en temps réel", "Optimisation des tournées"]
  },
  admin: {
    icon: "👨‍💼",
    title: "Gestion complète",
    desc: "Supervisez chauffeurs, réservations et recalculez les optimisations.",
    features: ["Tableau de bord global", "Analyses avancées", "Configuration système"]
  }
};

const STEPS_CONTENT = {
  0: {
    title: "Bienvenue",
    icon: "👋",
    getContent: (user, roleLabel) => ({
      mainText: `Bonjour ${user.username} 👋`,
      description: `Votre compte ${roleLabel} a été créé avec succès.`
    })
  },
  1: {
    title: "Fonctionnalités",
    icon: "✨",
    getContent: (user, roleLabel, rolePreview) => ({
      mainText: rolePreview.title,
      description: rolePreview.desc,
      features: rolePreview.features
    })
  },
  2: {
    title: "Statistiques",
    icon: "📊",
    getContent: () => ({
      mainText: "Chiffres clés",
      description: "Quelques statistiques importantes",
      stats: [
        { number: "500+", label: "Trajets/jour" },
        { number: "98%", label: "Satisfaction" },
        { number: "24/7", label: "Support" }
      ]
    })
  },
  3: {
    title: "Technologie",
    icon: "🚀",
    getContent: () => ({
      mainText: "Optimisation avancée",
      description: "Des algorithmes intelligents pour vos trajets",
      techInfo: "Knapsack + plus courts chemins (Dijkstra)"
    })
  },
  4: {
    title: "Final",
    icon: "🎯",
    getContent: () => ({
      mainText: "Prêt à commencer ?",
      description: "Accédez maintenant à votre dashboard"
    })
  }
};

const WelcomePage = memo(({ user, onContinue }) => {
  const [countdown, setCountdown] = useState(5);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = 5;

  const roleLabel = {
    passenger: "Passager",
    driver: "Chauffeur",
    admin: "Admin"
  }[user.role] || "Utilisateur";

  const rolePreview = ROLE_PREVIEWS[user.role] || ROLE_PREVIEWS.passenger;

  const currentData =
    STEPS_CONTENT[currentStep].getContent(user, roleLabel, rolePreview);

  /* ===== COUNTDOWN ===== */
  useEffect(() => {
    let timer;
    if (currentStep === 4 && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, currentStep]);

  /* ===== AUTO REDIRECT ===== */
  useEffect(() => {
    if (currentStep === 4 && countdown === 0) {
      onContinue(user);
    }
  }, [countdown, currentStep, onContinue, user]);

  /* ===== NAVIGATION ===== */
  const nextStep = () => currentStep < 4 && setCurrentStep((s) => s + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep((s) => s - 1);
  const goToStep = (i) => setCurrentStep(i);

  const getStepStatus = (index) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  /* ===== UI ===== */
  return (
    <div className="welcome-overlay">
      <div className="welcome-container">
        <div className="welcome-card">

          {/* ===== SIDEBAR ===== */}
          <div className="welcome-sidebar">
            <div className="step-indicators">
              {[...Array(totalSteps)].map((_, i) => (
                <button
                  key={i}
                  className={`step-dot step-dot-${getStepStatus(i)}`}
                  onClick={() => goToStep(i)}
                >
                  <span className="step-number">{i + 1}</span>
                  <span className="step-label">
                    {STEPS_CONTENT[i].title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== MAIN CONTENT ===== */}
          <div className="welcome-main">

            {/* HEADER */}
            <div className="welcome-header">
              <h1 className="welcome-title">
                <span className="welcome-icon">
                  {STEPS_CONTENT[currentStep].icon}
                </span>
                {STEPS_CONTENT[currentStep].title}
              </h1>
            </div>

            {/* CONTENT */}
            <div className="welcome-content">

              <div className="content-main-text">
                {currentData.mainText}
              </div>

              <div className="content-description">
                {currentData.description}
              </div>

              {/* FEATURES */}
              {currentData.features && (
                <div className="features-list">
                  {currentData.features.map((f, i) => (
                    <div key={i} className="feature-item">
                      <span className="feature-check">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* STATS */}
              {currentData.stats && (
                <div className="stats-grid">
                  {currentData.stats.map((s, i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-number">{s.number}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* TECH */}
              {currentData.techInfo && (
                <div className="tech-info">
                  <div className="tech-badge">💡 Innovation</div>
                  <p>{currentData.techInfo}</p>
                </div>
              )}

              {/* COUNTDOWN */}
              {currentStep === 4 && (
                <div className="countdown-section">
                  <div className="countdown-timer">
                    {countdown > 0 ? (
                      <>
                        <span className="countdown-number">
                          {countdown}
                        </span>
                        <span className="countdown-text">
                          secondes avant redirection
                        </span>
                      </>
                    ) : (
                      <span className="countdown-ready">
                        Redirection...
                      </span>
                    )}
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${((5 - countdown) / 5) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="welcome-buttons">
              <button
                className="btn btn-prev"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                ← Précédent
              </button>

              <div className="step-counter">
                Étape {currentStep + 1} / {totalSteps}
              </div>

              {currentStep < 4 ? (
                <button className="btn btn-next" onClick={nextStep}>
                  Suivant →
                </button>
              ) : (
                <button
                  className="btn btn-dashboard"
                  onClick={() => onContinue(user)}
                >
                  🚀 Dashboard
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

export default WelcomePage;