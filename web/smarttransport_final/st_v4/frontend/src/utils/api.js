const BASE = "http://localhost:5000/api";
const token = () => localStorage.getItem("st_token");

async function req(url, opts = {}) {
  const tk = token();
  const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || "Erreur serveur");
  return data;
}

export const api = {
  // Auth
  register:       (d)          => req("/auth/register", { method:"POST", body:JSON.stringify(d) }),
  login:          (email, pw)  => req("/auth/login",    { method:"POST", body:JSON.stringify({ email, password:pw }) }),
  getMe:          ()           => req("/auth/me"),
  updateProfile:  (username, email) => req("/auth/profile",  { method:"PUT", body:JSON.stringify({ username, email }) }),
  updatePassword: (currentPassword, newPassword) => req("/auth/password", { method:"PUT", body:JSON.stringify({ currentPassword, newPassword }) }),

  // Transport
  getCities:        ()         => req("/cities"),
  getRoutes:        ()         => req("/routes"),
  getStats:         ()         => req("/stats"),
  getClosedRoutes:  ()         => req("/routes").then(d=>({ closed:d.routes.filter(r=>r.status==="closed"), count:d.routes.filter(r=>r.status==="closed").length })),
  optimizeRoute:    (f,t,tl)   => req("/route/optimize",    { method:"POST", body:JSON.stringify({ from:f, to:t, trafficLevel:tl }) }),
  recalculateRoute: (f,t,cr)   => req("/route/recalculate", { method:"POST", body:JSON.stringify({ from:f, to:t, closedRoutes:cr }) }),
  optimizeKnapsack: (cap,cnt,vt)=>req("/knapsack",          { method:"POST", body:JSON.stringify({ capacity:cap, passengerCount:cnt, vehicleType:vt }) }),
  updateRouteStatus:(f,t,s,tf) => req(`/routes/${f}/${t}/status`, { method:"PUT", body:JSON.stringify({ status:s, trafficFactor:tf }) }),

  // Voitures
  getVoitures:     ()          => req("/voitures"),
  addVoiture:      (d)         => req("/voitures",       { method:"POST",   body:JSON.stringify(d) }),
  updateVoiture:   (id, d)     => req(`/voitures/${id}`, { method:"PUT",    body:JSON.stringify(d) }),
  deleteVoiture:   (id)        => req(`/voitures/${id}`, { method:"DELETE" }),

  // Réservations
  getReservations:   ()        => req("/reservations"),
  createReservation: (d)       => req("/reservations",              { method:"POST", body:JSON.stringify(d) }),
  updateStatutResa:  (id, d)   => req(`/reservations/${id}/statut`, { method:"PUT",  body:JSON.stringify(d) }),

  // Notifications
  getNotifications:  ()        => req("/reservations/notifications/mes"),
  marquerLue:        (id)      => req(`/reservations/notifications/${id}/lire`, { method:"PUT" }),
  toutMarquerLu:     ()        => req("/reservations/notifications/tout-lire",  { method:"PUT" }),

  // Cooperative
  getCoopVehicles:     ()          => req("/cooperatives/vehicles"),
  addCoopVehicle:      (d)         => req("/cooperatives/vehicles",       { method:"POST",   body:JSON.stringify(d) }),
  updateCoopVehicle:   (id, d)     => req(`/cooperatives/vehicles/${id}`, { method:"PUT",    body:JSON.stringify(d) }),
  deleteCoopVehicle:   (id)        => req(`/cooperatives/vehicles/${id}`, { method:"DELETE" }),

  getCoopDrivers:      ()          => req("/cooperatives/drivers"),
  getCoopReservations: ()          => req("/cooperatives/reservations"),

};

