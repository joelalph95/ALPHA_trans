import { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";

const ar = (n) => n ? `${parseInt(n).toLocaleString("fr-FR")} Ar` : "—";
const df = (iso) => { try { return new Date(iso).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"}); } catch { return iso||""; } };

const S = {
  en_attente:{ label:"En attente",  couleur:"var(--yellow)", fond:"rgba(250,204,21,0.08)" },
  confirmee: { label:"Confirmée",   couleur:"var(--green)",  fond:"rgba(74,222,128,0.08)" },
  refusee:   { label:"Refusée",     couleur:"var(--red)",    fond:"rgba(248,113,113,0.08)" },
  annulee:   { label:"Annulée",     couleur:"var(--red)",    fond:"rgba(248,113,113,0.05)" },
};

const VOI0 = { immatriculation:"", marque:"", modele:"", capacite:15, chauffeur:"", ligne:"", tarif_place:20000, heure_depart:"06:00" };

export default function ChauffeurPage({ user }) {
  const [tab, setTab]          = useState("reservations");
  const [reservations, setRes] = useState([]);
  const [voitures, setVoi]     = useState([]);
  const [loadingR, setLR]      = useState(true);
  const [showForm, setShowF]   = useState(false);
  const [editId, setEditId]    = useState(null);
  const [form, setForm]        = useState(VOI0);
  const [saving, setSaving]    = useState(false);
  const [motifs, setMotifs]    = useState({});
  const [msg, setMsg]          = useState({type:"",text:""});
  const [confirmDel, setCD]    = useState(null);

  const toast = (t,x) => { setMsg({type:t,text:x}); setTimeout(()=>setMsg({type:"",text:""}),4000); };
  const sf = (k)=>(e)=>setForm(f=>({...f,[k]:["capacite","tarif_place"].includes(k)?Number(e.target.value):e.target.value}));

  const loadRes = useCallback(async()=>{
    setLR(true);
    try { const d=await api.getReservations(); setRes(d.reservations); }
    catch(e){ toast("error",e.message); }
    finally { setLR(false); }
  },[]);

  const loadVoi = useCallback(async()=>{
    try { const d=await api.getVoitures(); setVoi(d.voitures); }
    catch(e){ toast("error",e.message); }
  },[]);

  useEffect(()=>{ loadRes(); loadVoi(); },[loadRes,loadVoi]);

  const handleStatut = async (id, statut) => {
    try {
      await api.updateStatutResa(id,{statut,motif_refus:motifs[id]||""});
      toast("success", statut==="confirmee"?"✅ Réservation confirmée. Le passager est notifié.":"❌ Réservation refusée. Le passager est notifié.");
      setMotifs(m=>({...m,[id]:""}));
      loadRes();
    } catch(e){ toast("error",e.message); }
  };

  const handleSave = async(e)=>{
    e.preventDefault(); setSaving(true);
    try {
      if(editId){ await api.updateVoiture(editId,form); toast("success","✅ Voiture mise à jour."); }
      else      { await api.addVoiture(form);            toast("success","✅ Voiture ajoutée."); }
      setShowF(false); setEditId(null); setForm(VOI0); loadVoi();
    } catch(e){ toast("error",e.message); }
    finally { setSaving(false); }
  };

  const handleEdit=(v)=>{ setForm({immatriculation:v.immatriculation,marque:v.marque,modele:v.modele,capacite:v.capacite,chauffeur:v.chauffeur||"",ligne:v.ligne||"",tarif_place:v.tarif_place||20000,heure_depart:v.heure_depart||"",statut:v.statut}); setEditId(v.id); setShowF(true); };
  const handleDel=async(id)=>{ try{ await api.deleteVoiture(id); toast("success","Voiture supprimée."); setCD(null); loadVoi(); } catch(e){ toast("error",e.message); } };

  const enAttente = reservations.filter(r=>r.statut==="en_attente");
  const traitees  = reservations.filter(r=>r.statut!=="en_attente");

  if (!user || !["driver","admin"].includes(user.role)) return (
    <div className="card" style={{maxWidth:420,margin:"4rem auto",textAlign:"center",padding:"3rem"}}>
      <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🚫</div>
      <div style={{fontWeight:700}}>Accès chauffeur / admin requis</div>
    </div>
  );

  const lbl = {style:{display:"block",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"0.3rem"}};

  return (
    <div>
      <div style={{marginBottom:"1.75rem"}}>
        <h1 style={{fontSize:"1.6rem",fontWeight:800,letterSpacing:"-0.03em",background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"0.25rem"}}>
          🚐 Espace Chauffeur
        </h1>
        <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>Gérez vos voitures et confirmez les réservations de vos passagers.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value" style={{color:"var(--yellow)"}}>{enAttente.length}</div><div className="stat-label">À confirmer</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--green)"}}>{reservations.filter(r=>r.statut==="confirmee").length}</div><div className="stat-label">Confirmées</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--accent)"}}>{voitures.length}</div><div className="stat-label">Mes voitures</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:"var(--accent2)",fontSize:"1rem"}}>{ar(reservations.filter(r=>r.statut==="confirmee").reduce((s,r)=>s+(r.tarif_total||0),0))}</div><div className="stat-label">Recette confirmée</div></div>
      </div>

      {msg.text&&<div style={{background:msg.type==="success"?"var(--green-dim)":"var(--red-dim)",border:`1px solid ${msg.type==="success"?"var(--green)":"var(--red)"}`,color:msg.type==="success"?"var(--green)":"var(--red)",borderRadius:"var(--radius)",padding:"0.75rem 1rem",marginBottom:"1rem",fontSize:"0.88rem"}}>{msg.text}</div>}

      {/* Onglets */}
      <div style={{display:"flex",gap:"0.25rem",marginBottom:"1.5rem",background:"var(--bg-input)",padding:"0.3rem",borderRadius:40,width:"fit-content",border:"1px solid var(--border)"}}>
        {[["reservations",`🔔 Réservations${enAttente.length>0?` (${enAttente.length})`:""}`],["voitures","🚐 Mes voitures"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{position:"relative",background:tab===v?"var(--accent)":"none",color:tab===v?"#fff":"var(--text-muted)",border:"none",borderRadius:40,padding:"0.45rem 1.1rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.82rem",transition:"all 0.2s",boxShadow:tab===v?"0 2px 8px rgba(249,115,22,0.3)":"none"}}>
            {l}
            {v==="reservations"&&enAttente.length>0&&<span style={{position:"absolute",top:-4,right:-4,background:"var(--red)",color:"#fff",borderRadius:"50%",width:17,height:17,fontSize:"0.58rem",fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{enAttente.length}</span>}
          </button>
        ))}
      </div>

      {/* ── RÉSERVATIONS ── */}
      {tab==="reservations"&&(
        <div>
          {loadingR?(<div style={{textAlign:"center",padding:"3rem",color:"var(--text-muted)"}}>Chargement…</div>)
          :reservations.length===0?(
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"3.5rem",textAlign:"center",color:"var(--text-muted)"}}>
              <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>📭</div>
              <div style={{fontWeight:700,marginBottom:"0.4rem"}}>Aucune réservation</div>
              <p style={{fontSize:"0.82rem"}}>Les passagers pourront réserver via leur espace dédié.</p>
            </div>
          ):(
            <>
              {enAttente.length>0&&(
                <>
                  <div style={{fontWeight:700,fontSize:"0.8rem",color:"var(--yellow)",marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                    ⏳ À confirmer ({enAttente.length})
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"1rem",marginBottom:"2rem"}}>
                    {enAttente.map(r=>(
                      <div key={r.id} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderLeft:"4px solid var(--yellow)",borderRadius:"var(--radius-lg)",padding:"1.25rem 1.4rem",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.5rem"}}>
                          <div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:"0.68rem",color:"var(--text-muted)"}}>{r.reference}</div>
                            <div style={{fontWeight:800,fontSize:"1rem",marginTop:"0.1rem"}}>{r.ville_depart} → {r.ville_arrivee}</div>
                            <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginTop:"0.15rem"}}>📅 {df(r.date_voyage)}</div>
                          </div>
                          <span style={{background:"rgba(250,204,21,0.08)",border:"1px solid var(--yellow)",color:"var(--yellow)",borderRadius:40,padding:"0.22rem 0.75rem",fontSize:"0.7rem",fontWeight:700}}>⏳ En attente</span>
                        </div>
                        <div style={{display:"flex",gap:"1.25rem",fontSize:"0.78rem",flexWrap:"wrap",alignItems:"center"}}>
                          <span>👤 <strong style={{color:"var(--text)"}}>{r.passager_nom}</strong></span>
                          <span style={{color:"var(--text-muted)"}}>📧 {r.passager_email}</span>
                          <span style={{color:"var(--text-muted)"}}>🪑 {r.nb_places} place{r.nb_places>1?"s":""}</span>
                          {r.bagages_lourds>0&&<span style={{color:"var(--text-muted)"}}>🧳 {r.bagages_lourds} bagage{r.bagages_lourds>1?"s":""} lourd{r.bagages_lourds>1?"s":""}</span>}
                          <span style={{fontFamily:"var(--font-mono)",color:"var(--green)",fontWeight:700}}>{ar(r.tarif_total)}</span>
                          {r.voiture&&<span style={{color:"var(--accent)"}}>{r.voiture.immatriculation}</span>}
                        </div>
                        {r.notes&&<div style={{fontSize:"0.75rem",color:"var(--text-muted)",fontStyle:"italic",background:"var(--bg-input)",borderRadius:"var(--radius)",padding:"0.4rem 0.7rem"}}>💬 "{r.notes}"</div>}
                        <input className="inp" type="text" placeholder="Motif de refus (optionnel)…" value={motifs[r.id]||""} onChange={e=>setMotifs(m=>({...m,[r.id]:e.target.value}))} style={{fontSize:"0.78rem"}}/>
                        <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
                          <button onClick={()=>handleStatut(r.id,"confirmee")} style={{flex:1,background:"var(--green-dim)",border:"1px solid var(--green)",color:"var(--green)",borderRadius:"var(--radius)",padding:"0.6rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.85rem",transition:"all 0.15s"}}>✅ Confirmer</button>
                          <button onClick={()=>handleStatut(r.id,"refusee")}  style={{flex:1,background:"var(--red-dim)",  border:"1px solid var(--red)",  color:"var(--red)",  borderRadius:"var(--radius)",padding:"0.6rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.85rem",transition:"all 0.15s"}}>❌ Refuser</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {traitees.length>0&&(
                <>
                  <div style={{fontWeight:700,fontSize:"0.78rem",color:"var(--text-muted)",marginBottom:"0.75rem"}}>Historique ({traitees.length})</div>
                  <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                    {traitees.map(r=>{
                      const s=S[r.statut]||S.en_attente;
                      return(
                        <div key={r.id} style={{background:"var(--bg-card)",border:`1px solid var(--border)`,borderLeft:`3px solid ${s.couleur}`,borderRadius:"var(--radius)",padding:"0.85rem 1.1rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem",opacity:r.statut==="annulee"?0.55:1}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:"0.88rem"}}>{r.ville_depart} → {r.ville_arrivee}</div>
                            <div style={{fontSize:"0.72rem",color:"var(--text-muted)",marginTop:"0.1rem"}}>👤 {r.passager_nom} · 🪑 {r.nb_places} · {ar(r.tarif_total)} · {df(r.date_voyage)}</div>
                          </div>
                          <span style={{background:s.fond,border:`1px solid ${s.couleur}`,color:s.couleur,borderRadius:40,padding:"0.2rem 0.65rem",fontSize:"0.68rem",fontWeight:700,whiteSpace:"nowrap"}}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── VOITURES ── */}
      {tab==="voitures"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <div style={{color:"var(--text-muted)",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700}}>{voitures.length} voiture{voitures.length!==1?"s":""}</div>
            <button onClick={()=>{setShowF(v=>!v);setEditId(null);setForm(VOI0);}} style={{background:"var(--accent)",color:"#fff",border:"none",borderRadius:40,padding:"0.45rem 1.1rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.82rem",boxShadow:"0 4px 14px rgba(249,115,22,0.25)"}}>
              {showForm&&!editId?"✕ Fermer":"+ Ajouter une voiture"}
            </button>
          </div>

          {showForm&&(
            <div style={{background:"var(--bg-card)",border:"1px solid var(--accent)",borderRadius:"var(--radius-lg)",padding:"1.5rem",marginBottom:"1.25rem"}}>
              <div style={{fontWeight:700,fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"1rem"}}>{editId?"✏️ Modifier":"➕ Nouvelle voiture"}</div>
              <form onSubmit={handleSave}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.7rem"}}>
                  {[["immatriculation","Immatriculation *","ex: 4444 TBE"],["marque","Marque *","ex: Toyota"],["modele","Modèle *","ex: HiAce"]].map(([k,l,p])=>(
                    <div key={k}><label {...lbl}>{l}</label><input className="inp" type="text" value={form[k]} onChange={sf(k)} required placeholder={p}/></div>
                  ))}
                  <div><label {...lbl}>Capacité (places) *</label><input className="inp" type="number" value={form.capacite} onChange={sf("capacite")} required min={1} max={50}/></div>
                  <div style={{gridColumn:"1/-1"}}><label {...lbl}>Nom du chauffeur</label><input className="inp" type="text" value={form.chauffeur} onChange={sf("chauffeur")} placeholder="ex: Rakoto Jean"/></div>
                  <div style={{gridColumn:"1/-1"}}><label {...lbl}>Ligne desservie</label><input className="inp" type="text" value={form.ligne} onChange={sf("ligne")} placeholder="ex: Antananarivo - Toamasina"/></div>
                  <div><label {...lbl}>Tarif / place (Ar)</label><input className="inp" type="number" value={form.tarif_place} onChange={sf("tarif_place")} min={0}/></div>
                  <div><label {...lbl}>Heure de départ</label><input className="inp" type="time" value={form.heure_depart} onChange={sf("heure_depart")}/></div>
                  {editId&&<div><label {...lbl}>Statut</label><select className="inp" value={form.statut||"disponible"} onChange={sf("statut")}><option value="disponible">Disponible</option><option value="en_route">En route</option><option value="maintenance">Maintenance</option></select></div>}
                </div>
                <div style={{display:"flex",gap:"0.75rem",marginTop:"0.75rem"}}>
                  <button type="submit" disabled={saving} style={{flex:1,background:"var(--accent)",color:"#fff",border:"none",borderRadius:"var(--radius)",padding:"0.65rem",cursor:saving?"not-allowed":"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.85rem",opacity:saving?0.7:1,boxShadow:"0 4px 14px rgba(249,115,22,0.25)"}}>
                    {saving?<><span className="spinner"/>Sauvegarde…</>:editId?"💾 Mettre à jour":"✅ Ajouter"}
                  </button>
                  <button type="button" onClick={()=>{setShowF(false);setEditId(null);}} style={{background:"var(--bg-input)",border:"1px solid var(--border)",color:"var(--text)",borderRadius:"var(--radius)",padding:"0.65rem 1rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:600,fontSize:"0.82rem"}}>Annuler</button>
                </div>
              </form>
            </div>
          )}

          {voitures.length===0?(
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"3.5rem",textAlign:"center",color:"var(--text-muted)"}}>
              <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>🚐</div>
              <div style={{fontWeight:700}}>Aucune voiture enregistrée</div>
              <p style={{fontSize:"0.82rem",marginTop:"0.4rem"}}>Ajoutez votre premier véhicule pour commencer.</p>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"1rem"}}>
              {voitures.map(v=>{
                const coul=v.statut==="disponible"?"var(--green)":v.statut==="en_route"?"var(--accent)":"var(--yellow)";
                return (
                  <div key={v.id} style={{background:"var(--bg-card)",border:`1px solid var(--border)`,borderLeft:`3px solid ${coul}`,borderRadius:"var(--radius-lg)",padding:"1.25rem",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontFamily:"var(--font-mono)",fontWeight:700,color:"var(--accent)",fontSize:"0.9rem"}}>{v.immatriculation}</div>
                        <div style={{fontWeight:700,marginTop:"0.1rem"}}>{v.marque} {v.modele}</div>
                      </div>
                      <span style={{background:`${coul}18`,border:`1px solid ${coul}`,color:coul,borderRadius:40,padding:"0.18rem 0.6rem",fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>{v.statut}</span>
                    </div>
                    <div style={{fontSize:"0.75rem",color:"var(--text-muted)",display:"flex",flexDirection:"column",gap:"0.18rem"}}>
                      <span>🪑 {v.capacite} places · {ar(v.tarif_place)}/place</span>
                      {v.chauffeur&&<span>👤 {v.chauffeur}</span>}
                      {v.ligne&&<span>📍 {v.ligne}</span>}
                      {v.heure_depart&&<span>🕐 Départ : {v.heure_depart}</span>}
                    </div>
                    <div style={{display:"flex",gap:"0.5rem",marginTop:"auto"}}>
                      <button onClick={()=>handleEdit(v)} style={{flex:1,background:"var(--bg-input)",border:"1px solid var(--border)",color:"var(--text)",borderRadius:"var(--radius)",padding:"0.35rem",cursor:"pointer",fontSize:"0.78rem",fontFamily:"var(--font-display)",fontWeight:600}}>✏️ Modifier</button>
                      <button onClick={()=>setCD(v.id)} style={{background:"var(--red-dim)",border:"1px solid var(--red)",color:"var(--red)",borderRadius:"var(--radius)",padding:"0.35rem 0.65rem",cursor:"pointer",fontSize:"0.78rem"}}>🗑️</button>
                    </div>
                    {confirmDel===v.id&&(
                      <div style={{background:"var(--red-dim)",border:"1px solid var(--red)",borderRadius:"var(--radius)",padding:"0.65rem",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                        <span style={{fontSize:"0.78rem",color:"var(--red)"}}>Supprimer {v.immatriculation} ?</span>
                        <div style={{display:"flex",gap:"0.5rem"}}>
                          <button onClick={()=>handleDel(v.id)} style={{flex:1,background:"var(--red)",color:"#fff",border:"none",borderRadius:"var(--radius)",padding:"0.35rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.75rem"}}>Confirmer</button>
                          <button onClick={()=>setCD(null)} style={{flex:1,background:"var(--bg-input)",border:"1px solid var(--border)",color:"var(--text)",borderRadius:"var(--radius)",padding:"0.35rem",cursor:"pointer",fontFamily:"var(--font-display)",fontSize:"0.75rem"}}>Annuler</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
