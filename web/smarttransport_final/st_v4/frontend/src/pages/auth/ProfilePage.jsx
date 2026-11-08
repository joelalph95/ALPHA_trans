import { useState } from "react";
import { api } from "utils/api";
import LogoIcon from "components/LogoIcon";

// Icônes SVG propres
const ROLE_ICONS = {
  passenger: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>
  ),
  driver: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="10" rx="2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 13h14" />
      <path d="M3 8h18" />
    </svg>
  ),
  admin: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

const ROLE_LABELS = {
  passenger: "Passager",
  driver: "Chauffeur",
  admin: "Administrateur"
};

export default function ProfilePage({ user, onUpdate, onLogout }) {
  const [tab, setTab] = useState("info");
  const [editForm, setEditForm] = useState({ username: user.username, email: user.email });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  // Mettre à jour le profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.updateProfile(editForm.username, editForm.email);
      localStorage.setItem("st_token", data.token);
      localStorage.setItem("st_user", JSON.stringify(data.user));
      onUpdate(data.user);
      showMsg("success", "✅ Profil mis à jour avec succès !");
    } catch (err) {
      showMsg("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Changer le mot de passe
  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm)
      return showMsg("error", "Les mots de passe ne correspondent pas.");
    if (pwForm.newPassword.length < 6)
      return showMsg("error", "Le nouveau mot de passe doit avoir au moins 6 caractères.");
    
    setLoading(true);
    try {
      await api.updatePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      showMsg("success", "✅ Mot de passe modifié avec succès !");
    } catch (err) {
      showMsg("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    padding: "0.65rem 0.9rem",
    width: "100%",
    fontFamily: "var(--font-display)",
    fontSize: "0.9rem",
    outline: "none",
  };

  return (
    <div>
      <div className="section-title">
        <span style={{ marginRight: "0.5rem" }}>👤</span> Mon profil
      </div>
      <p className="section-sub">Gérer vos informations personnelles et votre mot de passe</p>

      <div className="two-col">
        {/* Carte utilisateur */}
        <div>
          <div className="card" style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ 
              fontSize: "3.5rem", 
              marginBottom: "0.75rem",
              display: "flex",
              justifyContent: "center",
              color: user.role === "driver" ? "#f97316" : user.role === "admin" ? "#a855f7" : "#22d3ee"
            }}>
              {ROLE_ICONS[user.role] || ROLE_ICONS.passenger}
            </div>

            <div style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "0.25rem" }}>
              {user.username}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              {user.email}
            </div>

            <span className={`tag ${user.role === "admin" ? "tag-orange" : user.role === "driver" ? "tag-cyan" : "tag-green"}`}>
              {ROLE_ICONS[user.role]} {ROLE_LABELS[user.role]}
            </span>

            {user.created_at && (
              <div style={{ color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "0.75rem" }}>
                Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowConfirmLogout(true)}
            className="btn btn-danger"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}
          >
            <LogoIcon variant="red" size="1.2rem" />
            Se déconnecter
          </button>
        </div>

        {/* Confirmation déconnexion */}
        {showConfirmLogout && (
          <>
            <div 
              style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.5)", display: "flex",
                alignItems: "center", justifyContent: "center", zIndex: 9999
              }}
              onClick={() => setShowConfirmLogout(false)}
            />
            <div 
              style={{
                position: "fixed", background: "white", padding: "2rem",
                borderRadius: "var(--radius)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                maxWidth: "400px", width: "90%", textAlign: "center", zIndex: 10000
              }}
            >
              <LogoIcon variant="red" size="3rem" style={{ marginBottom: "1rem" }} />
              <h3 style={{ marginBottom: "0.5rem", color: "var(--text)" }}>Confirmer la déconnexion</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Voulez-vous vraiment vous déconnecter ?
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button className="btn btn-danger" onClick={() => { onLogout(); showMsg("success", "✅ Déconnexion réussie !"); setShowConfirmLogout(false); }} style={{ minWidth: "100px" }}>
                  OK
                </button>
                <button className="btn btn-secondary" onClick={() => setShowConfirmLogout(false)} style={{ minWidth: "100px" }}>
                  Annuler
                </button>
              </div>
            </div>
          </>
        )}

        {/* Formulaires */}
        <div className="card">
          {/* Onglets */}
          <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            <button
              className={`nav-btn ${tab === "info" ? "active" : ""}`}
              onClick={() => { setTab("info"); setMsg({ type: "", text: "" }); }}
            >
               Informations
            </button>
            <button
              className={`nav-btn ${tab === "password" ? "active" : ""}`}
              onClick={() => { setTab("password"); setMsg({ type: "", text: "" }); }}
            >
               Mot de passe
            </button>
          </div>

          {/* Message retour */}
          {msg.text && (
            <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`} style={{ marginBottom: "1rem" }}>
              {msg.text}
            </div>
          )}

          {/* Onglet Informations */}
          {tab === "info" && (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Nom d'utilisateur</label>
                <input 
                  type="text" 
                  value={editForm.username} 
                  required 
                  minLength={3}
                  onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                  style={inputStyle} 
                />
              </div>
              <div className="form-group">
                <label>Adresse email</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  required
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  style={inputStyle} 
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <input 
                  type="text" 
                  value={ROLE_LABELS[user.role]} 
                  disabled
                  style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Sauvegarde…</> : " Enregistrer les modifications"}
              </button>
            </form>
          )}

          {/* Onglet Mot de passe */}
          {tab === "password" && (
            <form onSubmit={handleChangePw}>
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input 
                  type="password" 
                  value={pwForm.currentPassword} 
                  required
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  style={inputStyle} 
                  placeholder="Votre mot de passe actuel" 
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={pwForm.newPassword} 
                  required 
                  minLength={6}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  style={inputStyle} 
                  placeholder="6 caractères minimum" 
                />
              </div>
              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={pwForm.confirm} 
                  required
                  onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  style={{
                    ...inputStyle,
                    borderColor: pwForm.confirm && pwForm.confirm !== pwForm.newPassword ? "var(--red)" : "var(--border)",
                  }}
                  placeholder="Répéter le nouveau mot de passe" 
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Modification…</> : " Changer le mot de passe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}