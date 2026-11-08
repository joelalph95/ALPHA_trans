import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

/* ── Constantes ──────────────────────────────────────── */
const LS_FORM = "st_resa_form";
const LS_VIEW = "st_resa_view";
const FORM0   = { voiture_id:"", ville_depart:"", ville_arrivee:"", date_voyage:"", nb_places:1, bagages_lourds:0, notes:"" };

const STATUT = {
  en_attente:{ label:"En attente",  icon:"⏳", couleur:"var(--yellow)", fond:"rgba(250,204,21,0.08)" },
  confirmee: { label:"Confirmée",   icon:"✅", couleur:"var(--green)",  fond:"rgba(74,222,128,0.08)" },
  refusee:   { label:"Refusée",     icon:"❌", couleur:"var(--red)",    fond:"rgba(248,113,113,0.08)" },
  annulee:   { label:"Annulée",     icon:"🚫", couleur:"var(--red)",    fond:"rgba(248,113,113,0.05)" },
};

const ar = (n) => n ? `${parseInt(n).toLocaleString("fr-FR")} Ar` : "—";
const df = (iso) => { try { return new Date(iso).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"}); } catch { return iso||""; } };
const tomorrow = () => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,16); };

export default function ReservationPage({ user }) {
  /* Persistance dans localStorage */
  const [view, setView] = useState(() => localStorage.getItem(LS_VIEW) || "nouvelle");
  const [form, setForm] = useState(() => { try { return {...FORM0,...JSON.parse(localStorage.getItem(LS_FORM)||"{}")}; } catch { return FORM0; } });

  const [voitures, setVoitures]   = useState([]);
  const [vChoisie, setVC]         = useState(null);
  const [reservations, setRes]    = useState([]);
  const [loading, setL]           = useState(false);
  const [loadingR, setLR]         = useState(true);
  const [msg, setMsg]             = useState({ type:"", text:"" });

  const toast = (t,x,d=5000) => { setMsg({type:t,text:x}); setTimeout(()=>setMsg({type:"",text:""}),d); };

  const go = (v) => { setView(v); localStorage.setItem(LS_VIEW,v); };

  /* Modifier un champ + sauvegarder dans localStorage */
  const sf = (k) => (e) => {
    const val = ["nb_places","bagages_lourds"].includes(k) ? Number(e.target.value) : e.target.value;
    setForm(f => { const nf={...f,[k]:val}; localStorage.setItem(LS_FORM,JSON.stringify(nf)); return nf; });
  };

  /* Choisir une voiture → pré-remplir les villes */
  const choisir = (v) => {
    setVC(v);
    setForm(f => {
      const [dep,arr] = v.ligne?.split(" - ") || ["",""];
      const nf = {...f, voiture_id:v.id, ville_depart:dep||f.ville_depart, ville_arrivee:arr||f.ville_arrivee};
      localStorage.setItem(LS_FORM,JSON.stringify(nf));
      return nf;
    });
  };

  /* Charger les voitures (et restaurer la voiture sélectionnée) */
  useEffect(() => {
    api.getVoitures().then(d => {
      setVoitures(d.voitures);
      if (form.voiture_id) {
        const v = d.voitures.find(v => v.id === form.voiture_id);
        if (v) setVC(v);
      }
    }).catch(() => toast("error","Impossible de charger les voitures."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Charger les réservations */
  const loadRes = useCallback(async () => {
    setLR(true);
    try { const d=await api.getReservations(); setRes(d.reservations); }
    catch(e){ toast("error",e.message); }
    finally { setLR(false); }
  },[]);
  useEffect(() => { loadRes(); }, [loadRes]);

  const tarif = vChoisie ? (vChoisie.tarif_place * form.nb_places) + (form.bagages_lourds * 3000) : 0;

  /* Soumettre */
  const submit = async (e) => {
    e.preventDefault();
    if (!form.voiture_id) return toast("error","Choisissez une voiture.");
    setL(true);
    try {
      const d = await api.createReservation(form);
      toast("success", d.message);
      setForm(FORM0); setVC(null);
      localStorage.setItem(LS_FORM, JSON.stringify(FORM0));
      go("mes"); loadRes();
    } catch(e){ toast("error",e.message); }
    finally { setL(false); }
  };

  /* Annuler */
  const annuler = async (id, ref) => {
    if (!window.confirm(`Annuler ${ref} ?`)) return;
    try { await api.updateStatutResa(id,{statut:"annulee"}); toast("success","Réservation annulée."); loadRes(); }
    catch(e){ toast("error",e.message); }
  };

  /* Guard */
  if (!user || user.role !== "passenger") return (
    <div className="card" style={{maxWidth:420,margin:"4rem auto",textAlign:"center",padding:"3rem"}}>
      <div style={{fontSize:"3rem",marginBottom:"1rem"}}>{!user?"🔐":"🚫"}</div>
      <div style={{fontWeight:700,marginBottom:"0.5rem"}}>{!user?"Connexion requise":"Espace passager uniquement"}</div>
      <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>{!user?"Connectez-vous pour réserver.":"Les chauffeurs ont leur propre espace."}</p>
    </div>
  );

  const disponibles = voitures.filter(v=>v.statut==="disponible");

  /* ── Rendu ────────────────────────────────────────────── */
  return (
    <div>
      {/* En-tête */}
      <div style={{marginBottom:"1.75rem"}}>
        <h1 style={{fontSize:"1.6rem",fontWeight:800,letterSpacing:"-0.03em",background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"0.25rem"}}>
          🎫 Réservation de place
        </h1>
        <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>
          Réservez votre place dans un taxi-brousse. Le chauffeur confirmera votre demande.
        </p>
      </div>

      {/* Onglets */}
      <div style={{display:"flex",gap:"0.25rem",marginBottom:"1.5rem",background:"var(--bg-input)",padding:"0.3rem",borderRadius:40,width:"fit-content",border:"1px solid var(--border)"}}>
        {[["nouvelle","➕ Nouvelle"],["mes",`📋 Mes réservations${reservations.length>0?` (${reservations.length})`:""}`]].map(([v,l])=>(
          <button key={v} onClick={()=>go(v)} style={{background:view===v?"var(--accent)":"none",color:view===v?"#fff":"var(--text-muted)",border:"none",borderRadius:40,padding:"0.45rem 1.1rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.82rem",transition:"all 0.2s",boxShadow:view===v?"0 2px 8px rgba(249,115,22,0.3)":"none"}}>{l}</button>
        ))}
      </div>

      {/* Toast */}
      {msg.text && (
        <div style={{background:msg.type==="success"?"var(--green-dim)":"var(--red-dim)",border:`1px solid ${msg.type==="success"?"var(--green)":"var(--red)"}`,color:msg.type==="success"?"var(--green)":"var(--red)",borderRadius:"var(--radius)",padding:"0.85rem 1.1rem",marginBottom:"1.25rem",fontSize:"0.88rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
          {msg.text}
        </div>
      )}

      {/* ════ NOUVELLE RÉSERVATION ════ */}
      {view==="nouvelle" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",alignItems:"start"}}>

          {/* Voitures */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"1.5rem"}}>
            <div style={{fontWeight:700,fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"1.1rem"}}>
              🚐 Choisir un taxi-brousse
            </div>
            {disponibles.length===0?(
              <div style={{textAlign:"center",color:"var(--text-muted)",padding:"2.5rem 0"}}>
                <div style={{fontSize:"2.5rem",marginBottom:"0.6rem"}}>🚐</div>
                <div style={{fontSize:"0.85rem"}}>Aucun taxi-brousse disponible pour le moment.</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"0.7rem"}}>
                {disponibles.map(v => {
                  const sel = vChoisie?.id===v.id;
                  return (
                    <div key={v.id} onClick={()=>choisir(v)}
                      style={{background:sel?"var(--accent-dim)":"var(--bg-input)",border:`1.5px solid ${sel?"var(--accent)":"var(--border)"}`,borderRadius:"var(--radius)",padding:"0.9rem 1rem",cursor:"pointer",transition:"all 0.18s",transform:sel?"scale(1.01)":"scale(1)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem"}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"var(--font-mono)",fontWeight:700,color:"var(--accent)",fontSize:"0.85rem",letterSpacing:"0.05em"}}>{v.immatriculation}</div>
                          <div style={{fontWeight:700,fontSize:"0.92rem",marginTop:"0.1rem"}}>{v.marque} {v.modele}</div>
                          {v.ligne&&<div style={{fontSize:"0.72rem",color:"var(--accent2)",marginTop:"0.2rem",fontWeight:600}}>📍 {v.ligne}</div>}
                          <div style={{display:"flex",gap:"0.75rem",marginTop:"0.3rem",fontSize:"0.72rem",color:"var(--text-muted)",flexWrap:"wrap"}}>
                            <span>🪑 {v.capacite} places</span>
                            {v.chauffeur&&<span>👤 {v.chauffeur}</span>}
                            {v.heure_depart&&<span>🕐 Départ {v.heure_depart}</span>}
                          </div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:"var(--font-mono)",fontWeight:700,color:"var(--green)",fontSize:"0.88rem"}}>{ar(v.tarif_place)}</div>
                          <div style={{fontSize:"0.62rem",color:"var(--text-muted)"}}>/place</div>
                          {sel&&<div style={{fontSize:"0.68rem",color:"var(--accent)",marginTop:"0.3rem",fontWeight:700}}>✓ Sélectionné</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {voitures.filter(v=>v.statut!=="disponible").length>0&&(
                  <div style={{fontSize:"0.7rem",color:"var(--text-dim)",borderTop:"1px solid var(--border)",paddingTop:"0.5rem",marginTop:"0.25rem"}}>
                    + {voitures.filter(v=>v.statut!=="disponible").length} véhicule(s) non disponible(s)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulaire */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"1.5rem"}}>
            <div style={{fontWeight:700,fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"1.1rem"}}>
              📝 Détails du voyage
            </div>
            {!vChoisie ? (
              <div style={{textAlign:"center",color:"var(--text-muted)",padding:"3rem 0",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.75rem"}}>
                <div style={{fontSize:"2.5rem"}}>👈</div>
                <div style={{fontSize:"0.85rem"}}>Sélectionnez un taxi-brousse à gauche</div>
              </div>
            ):(
              <form onSubmit={submit}>
                {/* Résumé voiture */}
                <div style={{background:"var(--accent-dim)",border:"1px solid var(--accent)",borderRadius:"var(--radius)",padding:"0.7rem 0.9rem",marginBottom:"1.1rem",fontSize:"0.82rem"}}>
                  <div style={{fontWeight:700,color:"var(--accent)"}}>{vChoisie.immatriculation} — {vChoisie.marque} {vChoisie.modele}</div>
                  {vChoisie.ligne&&<div style={{color:"var(--text-muted)",marginTop:"0.15rem",fontSize:"0.75rem"}}>📍 {vChoisie.ligne}{vChoisie.heure_depart&&` · 🕐 Départ habituel ${vChoisie.heure_depart}`}</div>}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.7rem"}}>
                  {[["ville_depart","Départ *","ex: Antananarivo"],["ville_arrivee","Arrivée *","ex: Toamasina"]].map(([k,lbl,ph])=>(
                    <div key={k}>
                      <label style={{display:"block",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"0.3rem"}}>{lbl}</label>
                      <input className="inp" type="text" value={form[k]} onChange={sf(k)} required placeholder={ph}/>
                    </div>
                  ))}
                </div>

                <div style={{marginTop:"0.7rem"}}>
                  <label style={{display:"block",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"0.3rem"}}>Date et heure *</label>
                  <input className="inp" type="datetime-local" value={form.date_voyage} onChange={sf("date_voyage")} required min={tomorrow()}/>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.7rem",marginTop:"0.7rem"}}>
                  <div>
                    <label style={{display:"block",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"0.3rem"}}>Places *</label>
                    <select className="inp" value={form.nb_places} onChange={sf("nb_places")}>
                      {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} place{n>1?"s":""}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"0.3rem"}}>Bagages lourds (+3 000 Ar)</label>
                    <select className="inp" value={form.bagages_lourds} onChange={sf("bagages_lourds")}>
                      <option value={0}>Aucun</option>
                      <option value={1}>1 pièce</option>
                      <option value={2}>2 pièces</option>
                    </select>
                  </div>
                </div>

                <div style={{marginTop:"0.7rem"}}>
                  <label style={{display:"block",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"0.3rem"}}>Notes</label>
                  <textarea className="inp" value={form.notes} onChange={sf("notes")} rows={2} placeholder="ex: Je serai à l'arrêt principal à 5h45…" style={{resize:"vertical"}}/>
                </div>

                {/* Récap tarif */}
                {tarif>0&&(
                  <div style={{background:"var(--bg-input)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"0.75rem",marginTop:"0.7rem",fontSize:"0.8rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.2rem"}}>
                      <span style={{color:"var(--text-muted)"}}>{form.nb_places} place{form.nb_places>1?"s":""} × {ar(vChoisie.tarif_place)}</span>
                      <span>{ar(vChoisie.tarif_place*form.nb_places)}</span>
                    </div>
                    {form.bagages_lourds>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.2rem"}}>
                      <span style={{color:"var(--text-muted)"}}>{form.bagages_lourds} bagage{form.bagages_lourds>1?"s":""} lourd{form.bagages_lourds>1?"s":""} × 3 000 Ar</span>
                      <span>{ar(form.bagages_lourds*3000)}</span>
                    </div>}
                    <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid var(--border)",paddingTop:"0.35rem",fontWeight:700}}>
                      <span>Total estimé</span>
                      <span style={{color:"var(--green)",fontFamily:"var(--font-mono)",fontSize:"0.95rem"}}>{ar(tarif)}</span>
                    </div>
                    <div style={{fontSize:"0.65rem",color:"var(--text-dim)",marginTop:"0.25rem"}}>💵 Paiement en espèces à bord</div>
                  </div>
                )}

                <button type="submit" disabled={loading||!form.ville_depart||!form.ville_arrivee||!form.date_voyage}
                  style={{marginTop:"1rem",background:loading||!form.ville_depart||!form.ville_arrivee||!form.date_voyage?"var(--text-dim)":"var(--accent)",color:"#fff",width:"100%",padding:"0.78rem",fontWeight:700,fontSize:"0.88rem",border:"none",borderRadius:"var(--radius)",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",fontFamily:"var(--font-display)",transition:"all 0.2s",boxShadow:!loading?"0 4px 16px rgba(249,115,22,0.25)":"none"}}>
                  {loading?<><span className="spinner"/>Envoi…</>:"🎫 Envoyer la réservation"}
                </button>
                <p style={{fontSize:"0.68rem",color:"var(--text-dim)",textAlign:"center",marginTop:"0.4rem"}}>Le chauffeur confirmera votre place dans les plus brefs délais</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ════ MES RÉSERVATIONS ════ */}
      {view==="mes"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:"0.5rem"}}>
            <div style={{color:"var(--text-muted)",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700}}>
              {reservations.length} réservation{reservations.length!==1?"s":""}
            </div>
            <button onClick={loadRes} style={{background:"var(--bg-input)",border:"1px solid var(--border)",color:"var(--text-muted)",borderRadius:"var(--radius)",padding:"0.3rem 0.75rem",cursor:"pointer",fontSize:"0.75rem",fontFamily:"var(--font-display)",transition:"all 0.15s"}} onMouseEnter={e=>{e.target.style.borderColor="var(--accent)";e.target.style.color="var(--accent)";}} onMouseLeave={e=>{e.target.style.borderColor="var(--border)";e.target.style.color="var(--text-muted)";}}>
              🔄 Actualiser
            </button>
          </div>

          {loadingR?(
            <div style={{textAlign:"center",padding:"3rem",color:"var(--text-muted)"}}>
              <span className="spinner" style={{width:24,height:24,border:"2px solid var(--border)",borderTopColor:"var(--accent)"}}/> Chargement…
            </div>
          ):reservations.length===0?(
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"3.5rem",textAlign:"center",color:"var(--text-muted)"}}>
              <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>🎫</div>
              <div style={{fontWeight:700,marginBottom:"0.5rem",fontSize:"1rem"}}>Aucune réservation</div>
              <p style={{fontSize:"0.85rem",marginBottom:"1.5rem"}}>Vous n'avez pas encore réservé de place.</p>
              <button onClick={()=>go("nouvelle")} style={{background:"var(--accent)",color:"#fff",border:"none",borderRadius:40,padding:"0.6rem 1.5rem",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.85rem",boxShadow:"0 4px 16px rgba(249,115,22,0.25)"}}>
                ➕ Faire une réservation
              </button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              {reservations.map(r=>{
                const s=STATUT[r.statut]||STATUT.en_attente;
                return (
                  <div key={r.id} style={{background:"var(--bg-card)",border:`1px solid var(--border)`,borderLeft:`4px solid ${s.couleur}`,borderRadius:"var(--radius-lg)",padding:"1.25rem 1.4rem",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.5rem"}}>
                      <div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:"0.68rem",color:"var(--text-muted)",letterSpacing:"0.05em"}}>{r.reference}</div>
                        <div style={{fontWeight:800,fontSize:"1.05rem",marginTop:"0.1rem"}}>{r.ville_depart} → {r.ville_arrivee}</div>
                        <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginTop:"0.15rem"}}>📅 {df(r.date_voyage)}</div>
                      </div>
                      <span style={{background:s.fond,border:`1px solid ${s.couleur}`,color:s.couleur,borderRadius:40,padding:"0.22rem 0.75rem",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                        {s.icon} {s.label}
                      </span>
                    </div>

                    <div style={{display:"flex",gap:"1.25rem",fontSize:"0.78rem",color:"var(--text-muted)",flexWrap:"wrap",alignItems:"center"}}>
                      {r.voiture&&<span>🚐 <strong style={{color:"var(--text)"}}>{r.voiture.immatriculation}</strong> {r.voiture.marque} {r.voiture.modele}</span>}
                      <span>🪑 {r.nb_places} place{r.nb_places>1?"s":""}</span>
                      {r.bagages_lourds>0&&<span>🧳 {r.bagages_lourds} bagage{r.bagages_lourds>1?"s":""} lourd{r.bagages_lourds>1?"s":""}</span>}
                      {r.tarif_total>0&&<span style={{fontFamily:"var(--font-mono)",color:"var(--accent)",fontWeight:700}}>{ar(r.tarif_total)}</span>}
                      {r.voiture?.chauffeur&&<span>👤 {r.voiture.chauffeur}</span>}
                    </div>

                    {r.notes&&<div style={{fontSize:"0.75rem",color:"var(--text-muted)",fontStyle:"italic",background:"var(--bg-input)",borderRadius:"var(--radius)",padding:"0.4rem 0.7rem"}}>💬 "{r.notes}"</div>}

                    {r.statut==="en_attente"&&<div style={{background:STATUT.en_attente.fond,border:`1px solid ${STATUT.en_attente.couleur}`,borderRadius:"var(--radius)",padding:"0.55rem 0.85rem",fontSize:"0.78rem",color:STATUT.en_attente.couleur}}>⏳ En attente de confirmation du chauffeur. Vous serez notifié(e) dès que c'est fait.</div>}
                    {r.statut==="confirmee"&&<div style={{background:STATUT.confirmee.fond,border:`1px solid ${STATUT.confirmee.couleur}`,borderRadius:"var(--radius)",padding:"0.55rem 0.85rem",fontSize:"0.78rem",color:STATUT.confirmee.couleur}}>✅ Place confirmée ! Montant à payer à bord en espèces : <strong>{ar(r.tarif_total)}</strong>. Soyez à l'heure au départ.</div>}
                    {r.statut==="refusee"&&<div style={{background:STATUT.refusee.fond,border:`1px solid ${STATUT.refusee.couleur}`,borderRadius:"var(--radius)",padding:"0.55rem 0.85rem",fontSize:"0.78rem",color:STATUT.refusee.couleur}}>❌ Refusée{r.motif_refus?` — ${r.motif_refus}`:""} . Essayez avec un autre véhicule.</div>}

                    {r.statut==="en_attente"&&(
                      <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <button onClick={()=>annuler(r.id,r.reference)} style={{background:"var(--red-dim)",border:"1px solid var(--red)",color:"var(--red)",borderRadius:"var(--radius)",padding:"0.3rem 0.85rem",cursor:"pointer",fontSize:"0.75rem",fontFamily:"var(--font-display)",fontWeight:700,transition:"all 0.15s"}}>
                          🚫 Annuler
                        </button>
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
