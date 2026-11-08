import { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";

export default function CooperativeDrivers({ user }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({type:"",text:""});
  const [search, setSearch] = useState("");

  const toast = (t,x) => { 
    setMsg({type:t,text:x}); 
    setTimeout(()=>setMsg({type:"",text:""}),4000); 
  };

  const loadDrivers = useCallback(async()=>{
    try {
      const data = await api.getCoopDrivers();
      setDrivers(data.drivers || []);
    } catch(e){
      toast("error",e.message);
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(()=>{
    loadDrivers();
  },[loadDrivers]);

  const filteredDrivers = drivers.filter(d => 
    d.username.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const lbl = {
    style:{
      display:"block",
      fontSize:"0.7rem",
      fontWeight:700,
      letterSpacing:"0.05em",
      textTransform:"uppercase",
      color:"var(--text-muted)",
      marginBottom:"0.4rem"
    }
  };

  if(loading) return <div style={{textAlign:"center",padding:"3rem",color:"var(--text-muted)"}}>Chargement des chauffeurs...</div>;

  return (
    <div>
      <div style={{marginBottom:"1.75rem"}}>
        <div style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          marginBottom:"1rem"
        }}>
          <h2 style={{
            fontSize:"1.3rem",
            fontWeight:800,
            margin:0
          }}>
            👥 Chauffeurs ({filteredDrivers.length}/{drivers.length})
          </h2>
          <button 
            style={{
              background:"var(--accent)",
              color:"#fff",
              border:"none",
              borderRadius:32,
              padding:"0.5rem 1.25rem",
              cursor:"pointer",
              fontFamily:"var(--font-display)",
              fontWeight:700,
              fontSize:"0.82rem",
              boxShadow:"0 4px 12px rgba(249,115,22,0.3)"
            }}
            onClick={async()=>{
              // TODO: Open modal to add driver (invite via email)
              toast("info","Ajout chauffeur via email - fonctionnalité à venir");
            }}
          >
            ➕ Inviter chauffeur
          </button>
        </div>
        
        <div style={{
          background:"var(--bg-input)",
          border:"1px solid var(--border)",
          borderRadius:32,
          padding:"0.5rem 1rem",
          display:"flex",
          alignItems:"center",
          gap:"0.75rem"
        }}>
          <span style={{color:"var(--text-muted)",fontSize:"0.9rem"}}>🔍</span>
          <input 
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{
              background:"none",
              border:"none",
              color:"var(--text)",
              fontSize:"0.9rem",
              flex:1,
              outline:"none"
            }}
          />
        </div>
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

      {filteredDrivers.length === 0 ? (
        <div style={{
          background:"var(--bg-card)",
          border:"1px solid var(--border)",
          borderRadius:"var(--radius-lg)",
          padding:"4rem 2rem",
          textAlign:"center",
          color:"var(--text-muted)"
        }}>
          <div style={{fontSize:"3.5rem",marginBottom:"1rem"}}>👥</div>
          <div style={{fontWeight:700,fontSize:"1.1rem",marginBottom:"0.5rem"}}>
            {search ? "Aucun chauffeur trouvé" : "Aucun chauffeur"}
          </div>
          <p style={{fontSize:"0.9rem"}}>
            {search ? `Aucun résultat pour "${search}"` : "Invitez vos premiers chauffeurs"}
          </p>
        </div>
      ) : (
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(350px,1fr))",
          gap:"1.25rem"
        }}>
          {filteredDrivers.map(d => (
            <div key={d.id} style={{
              background:"var(--bg-card)",
              border:"1px solid var(--border)",
              borderRadius:"var(--radius-lg)",
              padding:"1.5rem",
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center"
            }}>
              <div style={{flex:1}}>
                <div style={{
                  fontWeight:700,
                  fontSize:"1rem",
                  color:"var(--text)",
                  marginBottom:"0.25rem"
                }}>
                  {d.username}
                </div>
                <div style={{
                  fontSize:"0.82rem",
                  color:"var(--text-muted)",
                  marginBottom:"0.5rem"
                }}>
                  {d.email}
                </div>
                <div style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"1rem",
                  fontSize:"0.75rem",
                  color:"var(--text-muted)"
                }}>
                  <span>📅 {new Date(d.created_at).toLocaleDateString("fr-FR")}</span>
                  <span>ID: #{d.id}</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"end",gap:"0.5rem"}}>
                <span style={{
                  background:"var(--green-dim)",
                  color:"var(--green)",
                  border:"1px solid var(--green)",
                  borderRadius:24,
                  padding:"0.2rem 0.75rem",
                  fontSize:"0.7rem",
                  fontWeight:700
                }}>
                  Actif
                </span>
                <div style={{display:"flex",gap:"0.25rem"}}>
                  <button style={{
                    background:"var(--bg-input)",
                    border:"1px solid var(--border)",
                    color:"var(--text)",
                    borderRadius:"var(--radius)",
                    padding:"0.3rem 0.75rem",
                    fontSize:"0.7rem",
                    cursor:"pointer"
                  }}>
                    ✏️ Profil
                  </button>
                  <button style={{
                    background:"var(--yellow-dim)",
                    border:"1px solid var(--yellow)",
                    color:"var(--yellow)",
                    borderRadius:"var(--radius)",
                    padding:"0.3rem 0.5rem",
                    fontSize:"0.75rem",
                    cursor:"pointer"
                  }}>
                    🚗 Voitures
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
