import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================================
//  ⚙️  CONFIGURATION RÉSEAU LOCAL - CORRIGÉE
// ============================================================
//  
//  📌 Pour TESTER SUR ORDINATEUR (Web) :
//     → Utilise automatiquement localhost
//
//  📌 Pour TESTER SUR TÉLÉPHONE (Mobile) :
//     1. Trouve l'IP de ton PC : CMD → ipconfig → Adresse IPv4
//     2. Remplace l'IP ci-dessous (192.168.43.86) par la bonne
//     3. Téléphone et PC sur le MÊME WiFi
//
// ============================================================

// ⚠️ REMPLACEZ CETTE IP PAR LA VÔTRE POUR LE MOBILE ⚠️
const PC_IP = '192.168.43.86';  // ← METTEZ VOTRE IP ICI (trouvée avec ipconfig)

const BACKEND_PORT = '5001';

// Construction intelligente de l'URL
const getBaseUrl = () => {
  // Sur le WEB (navigateur de l'ordinateur)
  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}`;
  }
  // Sur MOBILE (téléphone réel)
  return `http://${PC_IP}:${BACKEND_PORT}`;
};

export const API_BASE_URL = getBaseUrl();

// ============================================================

const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

const request = async (method, endpoint, body = null, requireAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };

  if (requireAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  } catch (err) {
    // Erreur réseau avec plus d'informations
    if (err.message === 'Network request failed' || err.name === 'TypeError') {
      throw new Error(
        `❌ Impossible de joindre le serveur !\n\n` +
        `📡 URL testée : ${API_BASE_URL}\n` +
        `🖥️ Plateforme : ${Platform.OS === 'web' ? 'Web (ordinateur)' : 'Mobile (téléphone)'}\n\n` +
        `🔍 Vérifications :\n` +
        `• Le backend est-il démarré ? (npm run dev dans backend)\n` +
        `• ${Platform.OS === 'web' ? 'Ouvrez http://localhost:5000/api/villes' : `L'IP est-elle correcte ? (${PC_IP})`}\n` +
        `• ${Platform.OS === 'web' ? 'Le backend tourne-t-il sur le port 5000 ?' : 'Téléphone et PC sont-ils sur le même WiFi ?'}\n` +
        `• Le pare-feu autorise-t-il le port 5000 ?`
      );
    }
    throw err;
  }
};

// ── Auth ──────────────────────────────────────────────────────
export const login = (email, mot_de_passe) =>
  request('POST', '/auth/login', { email, mot_de_passe }, false);

export const register = (nom, email, mot_de_passe, role, telephone) =>
  request('POST', '/auth/register', { nom, email, mot_de_passe, role, telephone }, false);

export const getProfile = () => request('GET', '/auth/profile');

// ── Villes ───────────────────────────────────────────────────
export const getVilles = () => request('GET', '/villes');

// ── Demandes (Passager) ───────────────────────────────────────
export const createDemande = (ville_depart_id, ville_arrivee_id) =>
  request('POST', '/demandes', { ville_depart_id, ville_arrivee_id });

export const getMesDemandes = () => request('GET', '/demandes/mes-demandes');

// ── Demandes (Chauffeur/Admin) ────────────────────────────────
export const getAllDemandes = () => request('GET', '/demandes');

export const accepterDemande = (id) => request('PATCH', `/demandes/${id}/accepter`);
export const refuserDemande = (id) => request('PATCH', `/demandes/${id}/refuser`);

// ── Réservations ──────────────────────────────────────────────
export const getReservations = () => request('GET', '/reservations');

// ── Plannings ─────────────────────────────────────────────────
export const getPlannings = () => request('GET', '/plannings');