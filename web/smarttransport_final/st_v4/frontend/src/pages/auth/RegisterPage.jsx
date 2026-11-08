import { useState } from "react";
import { api } from "utils/api";

const ROLE_LABELS = {
  passenger: { label: "Passager",  desc: "Je cherche des trajets" },
  driver:    { label: "Chauffeur",  desc: "Je conduis un taxi-brousse" },
  cooperative : {label: "cooperative", desc:"je dirige la cooperative"},
};

export default function RegisterPage({ onSuccess, onGoLogin }) {
  const [form, setForm]       = useState({ username: "", email: "", password: "", confirm: "", role: "passenger" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm)
      return setError("Les mots de passe ne correspondent pas.");
    if (form.password.length < 6)
      return setError("Le mot de passe doit avoir au moins 6 caractères.");

    setLoading(true);
    try {
      const data = await api.register({ username: form.username, email: form.email, password: form.password, role: form.role });
      localStorage.setItem("st_token", data.token);
      localStorage.setItem("st_user", JSON.stringify(data.user));
      localStorage.setItem("st_firstLogin", "true");
      setSuccess(data.message);
      setTimeout(() => onSuccess(data.user), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const pw = form.password;
    if (!pw) return null;
    if (pw.length < 6)  return { level: 1, label: "Trop court", color: "var(--red)" };
    if (pw.length < 10) return { level: 2, label: "Moyen",     color: "var(--yellow)" };
    return              { level: 3, label: "Fort",             color: "var(--green)" };
  })();

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* En-tête */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
          Créer un compte
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            ULTRA TRANS MADAGASCAR
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>

          {/* Choix du rôle */}
          <div className="form-group">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {Object.entries(ROLE_LABELS).map(([r, info]) => (
                <div
                  key={r}
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  style={{
                    background: form.role === r ? "var(--accent-dim)" : "var(--bg-input)",
                    border: `1px solid ${form.role === r ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    padding: "0.75rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "1.4rem" }}>{info.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: form.role === r ? "var(--accent)" : "var(--text)" }}>
                    {info.label}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    {info.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              placeholder="Nom"
              value={form.username}
              onChange={set("username")}
              required
              minLength={3}
              style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", padding: "0.65rem 0.9rem", width: "100%", fontFamily: "var(--font-display)", fontSize: "0.9rem", outline: "none" }}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Adresse email</label>
            <input
              type="email"
              placeholder="votre Email"
              value={form.email}
              onChange={set("email")}
              required
              style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", padding: "0.65rem 0.9rem", width: "100%", fontFamily: "var(--font-display)", fontSize: "0.9rem", outline: "none" }}
            />
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="6 caractères minimum"
              value={form.password}
              onChange={set("password")}
              required
              style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", padding: "0.65rem 0.9rem", width: "100%", fontFamily: "var(--font-display)", fontSize: "0.9rem", outline: "none" }}
            />
            {strength && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem" }}>
                <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(strength.level / 3) * 100}%`, height: "100%", background: strength.color, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: "0.7rem", color: strength.color, fontWeight: 700 }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirmer */}
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="Répéter le mot de passe"
              value={form.confirm}
              onChange={set("confirm")}
              required
              style={{
                background: "var(--bg-input)",
                border: `1px solid ${form.confirm && form.confirm !== form.password ? "var(--red)" : "var(--border)"}`,
                borderRadius: "var(--radius)", color: "var(--text)", padding: "0.65rem 0.9rem",
                width: "100%", fontFamily: "var(--font-display)", fontSize: "0.9rem", outline: "none"
              }}
            />
            {form.confirm && form.confirm !== form.password && (
              <p style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: "0.3rem" }}>
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          {/* Erreur / succès */}
          {error   && <div className="alert alert-error"   style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✅ {success}</div>}

          {/* Bouton */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !!success}
          >
            {loading ? <><span className="spinner" /> Création du compte…</> : " Créer mon compte"}
          </button>
        </form>

        {/* Lien vers connexion */}
        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          Déjà un compte ?{" "}
          <button
            onClick={onGoLogin}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.82rem" }}
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
