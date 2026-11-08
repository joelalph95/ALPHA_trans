import { useState, useEffect } from "react";
import { api } from "utils/api";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaCar, FaArrowRight, FaSpinner } from "react-icons/fa";

export default function LoginPage({ onSuccess, onGoRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(form.email, form.password);
      localStorage.setItem("st_token", data.token);
      localStorage.setItem("st_user", JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
      const errorDiv = document.querySelector('.error-shake');
      if (errorDiv) {
        errorDiv.classList.add('shake');
        setTimeout(() => errorDiv.classList.remove('shake'), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    background: "var(--bg-input)",
    border: focusedField === field ? "2px solid var(--accent)" : "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    padding: "0.65rem 0.9rem 0.65rem 2.5rem",
    width: "100%",
    fontFamily: "var(--font-display)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.3s ease",
  });

  return (
    <div style={{
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      overflow: "hidden",
    }}>
      {/* Background animé */}
      <div style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Carte principale - Taille originale préservée */}
      <div style={{
        maxWidth: 400,
        width: "100%",
        margin: "0 auto",
        padding: "2rem 1rem",
        position: "relative",
        zIndex: 1,
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {/* Carte avec effet glassmorphism */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "var(--radius)",
          padding: "1.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          transition: "transform 0.3s ease",
        }}>
          
          {/* En-tête */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
              animation: "pulse 2s infinite",
            }}>
              <FaCar size={30} color="white" />
            </div>
            <h1 style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "0.25rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Connexion
            </h1>
            <p style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}>
              Bienvenue sur ULTRA TRANS <br /> MADAGASCAR
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Champ email */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text)",
              }}>
                Adresse email
              </label>
              <div style={{ position: "relative" }}>
                <FaEnvelope style={{
                  position: "absolute",
                  left: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: focusedField === "email" ? "var(--accent)" : "var(--text-muted)",
                  fontSize: "0.9rem",
                  transition: "color 0.3s ease",
                  pointerEvents: "none",
                }} />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={set("email")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle("email")}
                />
              </div>
            </div>

            {/* Champ mot de passe */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text)",
              }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <FaLock style={{
                  position: "absolute",
                  left: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: focusedField === "password" ? "var(--accent)" : "var(--text-muted)",
                  fontSize: "0.9rem",
                  transition: "color 0.3s ease",
                  pointerEvents: "none",
                }} />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="mot de passe"
                  value={form.password}
                  onChange={set("password")}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ ...inputStyle("password"), paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.7rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "1rem",
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="error-shake alert alert-error" style={{
                marginBottom: "1rem",
                padding: "0.65rem",
                borderRadius: "var(--radius)",
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.65rem 0.9rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "var(--radius)",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {loading ? (
                <>
                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                  <span>Connexion…</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Lien création de compte */}
          <div style={{
            textAlign: "center",
            marginTop: "1.25rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}>
            Pas encore de compte ?{" "}
            <button
              onClick={onGoRegister}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.82rem",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}