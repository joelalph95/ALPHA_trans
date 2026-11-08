import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Inject JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (nom, email, password, role) => api.post('/auth/register', { nom, email, password, role }),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/auth/profile/${userId}`, data),
  getAllUsers: () => api.get('/auth/users'),
  getUsersByRole: (role) => api.get(`/auth/users/role/${role}`),
}

// Trajets
export const trajetService = {
  rechercher: (villeDepart, villeArrivee, dateDepart) =>
    api.post('/trajets/rechercher', { villeDepart, villeArrivee, dateDepart }),
  consulterItineraire: (id) => api.get(`/trajets/${id}`),
}

// Optimisation
export const optimisationService = {
  optimiserRemplissage: (vehiculeId, listeDemandes) =>
    api.post(`/optimisation/vehicule/${vehiculeId}/remplissage`, { listeDemandes }),
  planifierTrajets: (vehiculeId, departures) =>
    api.post('/optimisation/planifier', { vehiculeId, departures }),
}

// Admin
export const adminService = {
  mettreAJourTrafic: (routeId, trafic, etat) =>
    api.put(`/admin/routes/${routeId}/trafic`, { trafic, etat }),
  ajouterRoute: (data) => api.post('/admin/routes', data),
  obtenirStatistiques: () => api.get('/admin/statistiques'),
}

export default api
