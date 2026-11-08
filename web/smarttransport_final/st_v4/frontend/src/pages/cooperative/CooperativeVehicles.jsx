import { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";

const VOI0 = { 
  immatriculation:"", marque:"", modele:"", capacite:15, chauffeur:"", ligne:"", 
  tarif_place:20000, heure_depart:"06:00", statut:"disponible" 
};

export default function CooperativeVehicles({ user }) {
  const [voitures, setVoi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowF] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(VOI0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({type:"",text:""});
  const [confirmDel, setCD] = useState(null);

  const toast = (t,x) => { 
    setMsg({type:t,text:x}); 
    setTimeout(()=>setMsg({type:"",text:""}),4000); 
  };

  const sf = (k)=>(e)=>{
    const val = ["capacite","tarif_place"].includes(k) ? Number(e.target.value) : e.target.value;
    setForm(f=>({...f,[k]:val}));
  };

  const loadVoi = useCallback(async()=>{
    try {
      const data = await api.getCoopVehicles();
      setVoi(data.vehicles || []);
    } catch(e){
      toast("error",e.message);
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(()=>{
    loadVoi();
  },[loadVoi]);

  const handleSave = async(e)=>{
    e.preventDefault(); 
    setSaving(true);
    try {
      if(editId){ 
        await api.updateCoopVehicle(editId, form); 
        toast("success","✅ Voiture mise à jour.");
      } else { 
        await api.addCoopVehicle(form); 
        toast("success","✅ Voiture ajoutée.");
      }
      setShowF(false); 
      setEditId(null); 
      setForm(VOI0); 
      loadVoi();
    } catch(e){ 
      toast("error",e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleEdit = (v) => {
    setForm({
      immatriculation:v.immatriculation,
      marque:v.marque,
      modele:v.modele,
      capacite:v.capacite,
      chauffeur:v.chauffeur||"",
      ligne:v.ligne||"",
      tarif_place:v.tarif_place||20000,
      heure_depart:v.heure_depart||"",
      statut:v.statut||"disponible"
    }); 
    setEditId(v.id); 
    setShowF(true); 
  };

  const handleDel = async(id)=>{
    try{ 
      await api.deleteCoopVehicle(id); 
      toast("success","Voiture supprimée."); 
      setCD(null); 
      loadVoi(); 
    } catch(e){ 
      toast("error",e.message); 
    }
  };

  const lbl = {
    style:{
      display:"block",
      fontSize:"0.7rem",
      fontWeight:700,
      letterSpacing:"0.05em",
      textTransform:"uppercase",
      color:"var(--text-muted)",
      marginBottom:"0.3rem"
    }
  };

  if(loading) return <div style={{textAlign:"center",padding:"3rem",color:"var(--text-muted)"}}>Chargement des véhicules...</div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
        <div style={{color:"var(--text-muted)",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700}}>
          {voitures.length} véhicule{voitures.length!==1?"s":""}
        </div>
        <button 
          onClick={()=>{
            setShowF(v=>!v);
            setEditId(null);
            setForm(VOI0);
          }} 
          style={{
            background:"var(--accent)",
            color:"#fff",
            border:"none",
            borderRadius:40,
            padding:"0.5rem 1.25rem",
            cursor:"pointer",
            fontFamily:"var(--font-display)",
            fontWeight:700,
            fontSize:"0.85rem",
            boxShadow:"0 4px 14px rgba(249,115,22,0.3)"
          }}
        >
          {showForm&&!editId ? "✕ Fermer" : "+ Ajouter véhicule"}
        </button>
      </div>

      {msg.text && (
        <div style={{
          background: msg.type==="success" ? "var(--green-dim)" : "var(--red-dim)",
          border: `1px solid ${msg.type==="success" ? "var(--green)" : "var(--red)"}`,
          color: msg.type==="success" ? "var(--green)" : "var(--red)",
          borderRadius:"var(--radius)",
          padding:"0.75rem 1rem",
          marginBottom:"1.5rem",
          fontSize:"0.88rem"
        }}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div style={{
          background:"var(--bg-card)",
          border:"1px solid var(--accent)",
          borderRadius:"var(--radius-lg)",
          padding:"1.75rem",
          marginBottom:"1.75rem"
        }}>
          <div style={{
            fontWeight:700,
            fontSize:"0.75rem",
            letterSpacing:"0.08em",
            textTransform:"uppercase",
            color:"var(--accent)",
            marginBottom:"1.25rem"
          }}>
            {editId ? "✏️ Modifier véhicule" : "➕ Nouveau véhicule"}
          </div>
          <form onSubmit={handleSave}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              {[["immatriculation","Immatriculation *","ex: 4444 TBE 202 MG"],["marque","Marque *","Toyota"],["modele","Modèle *","HiAce"]].map(([k,l,p])=>(
                <div key={k}>
                  <label {...lbl}>{l}</label>
                  <input 
                    className="inp" 
                    type="text" 
                    value={form[k]} 
                    onChange={sf(k)} 
                    required 
                    placeholder={p}
                    style={{fontSize:"0.88rem"}}
                  />
                </div>
              ))}
              <div>
                <label {...lbl}>Capacité (places) *</label>
                <input 
                  className="inp" 
                  type="number" 
                  value={form.capacite} 
                  onChange={sf("capacite")} 
                  required 
                  min={1} 
                  max={50}
                  style={{fontSize:"0.88rem"}}
                />
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label {...lbl}>Chauffeur assigné</label>
                <input 
                  className="inp" 
                  type="text" 
                  value={form.chauffeur} 
                  onChange={sf("chauffeur")} 
                  placeholder="ex: Rakoto Jean"
                  style={{fontSize:"0.88rem"}}
                />
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label {...lbl}>Ligne principale</label>
                <input 
                  className="inp" 
                  type="text" 
                  value={form.ligne} 
                  onChange={sf("ligne")} 
                  placeholder="ex: Antananarivo → Toamasina"
                  style={{fontSize:"0.88rem"}}
                />
              </div>
              <div>
                <label {...lbl}>Tarif / place (Ar)</label>
                <input 
                  className="inp" 
                  type="number" 
                  value={form.tarif_place} 
                  onChange={sf("tarif_place")} 
                  min={0}
                  style={{fontSize:"0.88rem"}}
                />
              </div>
              <div>
                <label {...lbl}>Heure départ habituelle</label>
                <input 
                  className="inp" 
                  type="time" 
                  value={form.heure_depart} 
                  onChange={sf("heure_depart")}
                  style={{fontSize:"0.88rem"}}
                />
              </div>
              {editId && (
                <div>
                  <label {...lbl}>Statut</label>
                  <select 
                    className="inp" 
                    value={form.statut||"disponible"} 
                    onChange={sf("statut")}
                    style={{fontSize:"0.88rem"}}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_route">En route</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:"1rem"}}>
              <button 
                type="submit" 
                disabled={saving}
                style={{
                  flex:1,
                  background:"var(--accent)",
                  color:"#fff",
                  border:"none",
                  borderRadius:"var(--radius)",
                  padding:"0.75rem",
                  cursor:saving?"not-allowed":"pointer",
                  fontFamily:"var(--font-display)",
                  fontWeight:700,
                  fontSize:"0.9rem",
                  opacity:saving?0.7:1,
                  boxShadow:"0 4px 16px rgba(249,115,22,0.3)"
                }}
              >
                {saving ? (
                  <>
                    <span className="spinner" style={{marginRight:"0.5rem"}}/>
                    Sauvegarde…
                  </>
                ) : editId ? "💾 Mettre à jour" : "✅ Ajouter véhicule"}
              </button>
              <button 
                type="button" 
                onClick={()=>{
                  setShowF(false);
                  setEditId(null);
                }} 
                style={{
                  flex:1,
                  background:"var(--bg-input)",
                  border:"1px solid var(--border)",
                  color:"var(--text)",
                  borderRadius:"var(--radius)",
                  padding:"0.75rem",
                  cursor:"pointer",
                  fontFamily:"var(--font-display)",
                  fontWeight:600,
                  fontSize:"0.88rem"
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {voitures.length === 0 ? (
        <div style={{
          background:"var(--bg-card)",
          border:"1px solid var(--border)",
          borderRadius:"var(--radius-lg)",
          padding:"4rem 2rem",
          textAlign:"center",
          color:"var(--text-muted)"
        }}>
          <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🚐</div>
          <div style={{fontWeight:700,fontSize:"1.1rem",marginBottom:"0.5rem"}}>Aucun véhicule</div>
          <p style={{fontSize:"0.9rem"}}>Ajoutez le premier véhicule de votre coopérative</p>
        </div>
      ) : (
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",
          gap:"1.25rem"
        }}>
          {voitures.map(v => {
            const statusColors = {
              disponible: "var(--green)",
              en_route: "var(--accent)",
              maintenance: "var(--yellow)"
            };
            const color = statusColors[v.statut] || "var(--text-muted)";
            return (
              <div key={v.id} style={{
                background:"var(--bg-card)",
                border:`1px solid var(--border)`,
                borderLeft:`4px solid ${color}`,
                borderRadius:"var(--radius-lg)",
                padding:"1.5rem",
                display:"flex",
                flexDirection:"column",
                gap:"1rem"
              }}>
                <div style={{
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"flex-start",
                  marginBottom:"0.5rem"
                }}>
                  <div>
                    <div style={{
                      fontFamily:"var(--font-mono)",
                      fontWeight:800,
                      color:"var(--accent)",
                      fontSize:"1rem"
                    }}>
                      {v.immatriculation}
                    </div>
                    <div style={{fontWeight:700,color:"var(--text)",marginTop:"0.25rem"}}>
                      {v.marque} {v.modele}
                    </div>
                  </div>
                  <span style={{
                    background:`${color}20`,
                    border:`1px solid ${color}`,
                    color:color,
                    borderRadius:32,
                    padding:"0.3rem 0.8rem",
                    fontSize:"0.7rem",
                    fontWeight:700,
                    letterSpacing:"0.05em",
                    textTransform:"uppercase"
                  }}>
                    {v.statut}
                  </span>
                </div>
                <div style={{
                  fontSize:"0.82rem",
                  color:"var(--text-muted)",
                  display:"flex",
                  flexDirection:"column",
                  gap:"0.3rem",
                  marginTop:"0.5rem"
                }}>
                  <span>🪑 {v.capacite} places · {v.tarif_place?.toLocaleString("fr-FR")} Ar/place</span>
                  {v.chauffeur && <span>👤 {v.chauffeur}</span>}
                  {v.ligne && <span>📍 {v.ligne}</span>}
                  {v.heure_depart && <span>🕐 {v.heure_depart}</span>}
                </div>
                <div style={{display:"flex",gap:"0.75rem",marginTop:"auto"}}>
                  <button 
                    onClick={()=>handleEdit(v)}
                    style={{
                      flex:1,
                      background:"var(--bg-input)",
                      border:"1px solid var(--border)",
                      color:"var(--text)",
                      borderRadius:"var(--radius)",
                      padding:"0.5rem",
                      cursor:"pointer",
                      fontSize:"0.82rem",
                      fontFamily:"var(--font-display)",
                      fontWeight:600
                    }}
                  >
                    ✏️ Modifier
                  </button>
                  <button 
                    onClick={()=>setCD(v.id)}
                    style={{
                      background:"var(--red-dim)",
                      border:"1px solid var(--red)",
                      color:"var(--red)",
                      borderRadius:"var(--radius)",
                      padding:"0.5rem 0.75rem",
                      cursor:"pointer",
                      fontSize:"0.82rem",
                      fontFamily:"var(--font-display)"
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
                {confirmDel === v.id && (
                  <div style={{
                    background:"var(--red-dim)",
                    border:"1px solid var(--red)",
                    borderRadius:"var(--radius)",
                    padding:"1rem",
                    display:"flex",
                    flexDirection:"column",
                    gap:"0.75rem"
                  }}>
                    <span style={{fontSize:"0.85rem",color:"var(--red)"}}>
                      Supprimer <strong>{v.immatriculation}</strong> ?
                    </span>
                    <div style={{display:"flex",gap:"0.75rem"}}>
                      <button 
                        onClick={()=>handleDel(v.id)}
                        style={{
                          flex:1,
                          background:"var(--red)",
                          color:"#fff",
                          border:"none",
                          borderRadius:"var(--radius)",
                          padding:"0.5rem",
                          cursor:"pointer",
                          fontFamily:"var(--font-display)",
                          fontWeight:700,
                          fontSize:"0.82rem"
                        }}
                      >
                        Confirmer suppression
                      </button>
                      <button 
                        onClick={()=>setCD(null)}
                        style={{
                          flex:1,
                          background:"var(--bg-input)",
                          border:"1px solid var(--border)",
                          color:"var(--text)",
                          borderRadius:"var(--radius)",
                          padding:"0.5rem",
                          cursor:"pointer",
                          fontFamily:"var(--font-display)",
                          fontSize:"0.82rem"
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
