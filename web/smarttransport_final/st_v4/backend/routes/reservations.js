/**
 * SmartTransport — Réservations taxi-brousse Madagascar
 * Logique réelle :
 * - Prix fixe par ligne (ex: TNR→TML = 25 000 Ar/place)
 * - Supplément bagage lourd : 3 000 Ar/pièce
 * - Chauffeur confirme ou refuse chaque réservation
 * - Notifications persistantes passager ↔ chauffeur
 * - Réservations sauvegardées dans reservations.json
 */

const express = require("express");
const router  = express.Router();
const fs      = require("fs");
const path    = require("path");
const { requireAuth } = require("../middleware/auth");

const RES_F   = path.join(__dirname, "../data/reservations.json");
const NOTIF_F = path.join(__dirname, "../data/notifications.json");
const VOI_F   = path.join(__dirname, "../data/voitures.json");

const readRes   = ()  => JSON.parse(fs.readFileSync(RES_F,   "utf-8"));
const writeRes  = (d) => fs.writeFileSync(RES_F,   JSON.stringify(d, null, 2));
const readNotif = ()  => JSON.parse(fs.readFileSync(NOTIF_F, "utf-8"));
const writeNotif= (d) => fs.writeFileSync(NOTIF_F, JSON.stringify(d, null, 2));
const readVoi   = ()  => JSON.parse(fs.readFileSync(VOI_F,   "utf-8"));
const genId     = (p) => p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,4).toUpperCase();

function notifier({ dest_id, dest_role, type, titre, message, res_id }) {
  const data = readNotif();
  data.notifications.push({
    id: genId("N"), dest_id: String(dest_id), dest_role, type,
    titre, message, reservation_id: res_id,
    lue: false, created_at: new Date().toISOString(),
  });
  writeNotif(data);
}

function placesOccupees(reservations, voiture_id, date_voyage) {
  return reservations
    .filter(r => r.voiture_id === voiture_id && r.date_voyage === date_voyage
              && ["en_attente","confirmee"].includes(r.statut))
    .reduce((s, r) => s + r.nb_places, 0);
}

// ══════════════════════════════
// GET /api/reservations
// ══════════════════════════════
router.get("/", requireAuth, (req, res) => {
  try {
    const { reservations } = readRes();
    const { voitures }     = readVoi();
    let liste;
    if (req.user.role === "passenger") {
      liste = reservations.filter(r => String(r.passager_id) === String(req.user.id));
    } else if (req.user.role === "driver") {
      const mesIds = voitures.filter(v => String(v.chauffeur_id) === String(req.user.id)).map(v => v.id);
      liste = reservations.filter(r => mesIds.includes(r.voiture_id));
    } else {
      liste = reservations;
    }
    const enrichi = liste
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(r => ({ ...r, voiture: voitures.find(v => v.id === r.voiture_id) || null }));
    res.json({ success: true, reservations: enrichi });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ══════════════════════════════
// POST /api/reservations — passager crée
// ══════════════════════════════
router.post("/", requireAuth, (req, res) => {
  try {
    const { voiture_id, ville_depart, ville_arrivee, date_voyage,
            nb_places = 1, bagages_lourds = 0, notes = "" } = req.body;

    if (!voiture_id || !ville_depart || !ville_arrivee || !date_voyage)
      return res.status(400).json({ success: false, error: "voiture_id, ville_depart, ville_arrivee et date_voyage sont requis." });

    const { voitures } = readVoi();
    const voiture = voitures.find(v => v.id === voiture_id);
    if (!voiture)
      return res.status(404).json({ success: false, error: "Voiture introuvable." });
    if (voiture.statut === "maintenance")
      return res.status(400).json({ success: false, error: "Ce véhicule est en maintenance." });

    const { reservations } = readRes();
    const occupees = placesOccupees(reservations, voiture_id, date_voyage);
    const demande  = parseInt(nb_places);

    if (occupees + demande > voiture.capacite)
      return res.status(400).json({
        success: false,
        error: `Plus assez de places. Disponibles : ${voiture.capacite - occupees} / ${voiture.capacite}.`,
      });

    // Anti-doublon
    const doublon = reservations.find(r =>
      String(r.passager_id) === String(req.user.id) &&
      r.voiture_id === voiture_id && r.date_voyage === date_voyage &&
      ["en_attente","confirmee"].includes(r.statut)
    );
    if (doublon)
      return res.status(409).json({ success: false, error: "Vous avez déjà une réservation active sur ce trajet à cette date." });

    const tarif_total = (voiture.tarif_place * demande) + (parseInt(bagages_lourds) * 3000);

    const resa = {
      id: genId("R"), reference: "RES-" + Date.now().toString(36).toUpperCase(),
      passager_id:    String(req.user.id),
      passager_nom:   req.user.username,
      passager_email: req.user.email,
      voiture_id, ville_depart: ville_depart.trim(), ville_arrivee: ville_arrivee.trim(),
      date_voyage, nb_places: demande, bagages_lourds: parseInt(bagages_lourds),
      notes: notes.trim(), tarif_total,
      statut: "en_attente", motif_refus: "",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };

    const data = readRes();
    data.reservations.push(resa);
    writeRes(data);

    // Notif chauffeur
    if (voiture.chauffeur_id) {
      notifier({
        dest_id: voiture.chauffeur_id, dest_role: "driver",
        type: "nouvelle_reservation", titre: "🔔 Nouvelle demande de place",
        message: `${req.user.username} demande ${demande} place(s) sur ${voiture.immatriculation} — ${ville_depart} → ${ville_arrivee} le ${new Date(date_voyage).toLocaleDateString("fr-FR")}. Tarif : ${tarif_total.toLocaleString()} Ar.`,
        res_id: resa.id,
      });
    }

    // Notif passager (accusé de réception)
    notifier({
      dest_id: req.user.id, dest_role: "passenger",
      type: "reservation_envoyee", titre: "📨 Réservation envoyée",
      message: `Votre réservation ${resa.reference} sur ${voiture.marque} ${voiture.modele} (${voiture.immatriculation}) — ${ville_depart} → ${ville_arrivee} le ${new Date(date_voyage).toLocaleDateString("fr-FR")} a bien été reçue. En attente de confirmation du chauffeur.`,
      res_id: resa.id,
    });

    res.status(201).json({
      success: true,
      message: `Réservation ${resa.reference} envoyée ! Le chauffeur ${voiture.chauffeur} va confirmer.`,
      reservation: { ...resa, voiture },
    });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ══════════════════════════════
// PUT /api/reservations/:id/statut — chauffeur confirme/refuse
// ══════════════════════════════
router.put("/:id/statut", requireAuth, (req, res) => {
  try {
    const { statut, motif_refus = "" } = req.body;
    if (!["confirmee","refusee","annulee"].includes(statut))
      return res.status(400).json({ success: false, error: "Statut invalide." });

    const data  = readRes();
    const resa  = data.reservations.find(r => r.id === req.params.id);
    if (!resa) return res.status(404).json({ success: false, error: "Réservation introuvable." });

    const { voitures } = readVoi();
    const voiture = voitures.find(v => v.id === resa.voiture_id);

    const estChauffeur = voiture && String(voiture.chauffeur_id) === String(req.user.id);
    const estPassager  = String(resa.passager_id) === String(req.user.id);
    const estAdmin     = req.user.role === "admin";

    if (["confirmee","refusee"].includes(statut) && !estChauffeur && !estAdmin)
      return res.status(403).json({ success: false, error: "Seul le chauffeur peut confirmer ou refuser." });
    if (statut === "annulee" && !estPassager && !estChauffeur && !estAdmin)
      return res.status(403).json({ success: false, error: "Non autorisé." });
    if (["confirmee","refusee"].includes(resa.statut))
      return res.status(400).json({ success: false, error: `Réservation déjà ${resa.statut}.` });

    resa.statut = statut; resa.motif_refus = motif_refus.trim();
    resa.updated_at = new Date().toISOString();
    writeRes(data);

    const msgs = {
      confirmee: { titre: "✅ Réservation confirmée !", message: `Votre place est confirmée sur ${voiture?.immatriculation || ""} — ${resa.ville_depart} → ${resa.ville_arrivee} le ${new Date(resa.date_voyage).toLocaleDateString("fr-FR")}. Montant à payer : ${resa.tarif_total?.toLocaleString()} Ar en espèces à bord.` },
      refusee:   { titre: "❌ Réservation refusée",   message: `Votre réservation ${resa.reference} a été refusée.${motif_refus ? " Motif : " + motif_refus : ""} Essayez avec un autre véhicule.` },
      annulee:   { titre: "🚫 Réservation annulée",   message: `La réservation ${resa.reference} — ${resa.ville_depart} → ${resa.ville_arrivee} a été annulée.` },
    };

    notifier({ dest_id: resa.passager_id, dest_role: "passenger", type: `reservation_${statut}`, ...msgs[statut], res_id: resa.id });

    if (statut === "annulee" && estPassager && voiture?.chauffeur_id) {
      notifier({ dest_id: voiture.chauffeur_id, dest_role: "driver", type: "reservation_annulee", titre: "🚫 Annulation", message: `${resa.passager_nom} a annulé sa réservation ${resa.reference} (${resa.ville_depart} → ${resa.ville_arrivee} du ${new Date(resa.date_voyage).toLocaleDateString("fr-FR")}).`, res_id: resa.id });
    }

    res.json({ success: true, message: `Réservation ${statut}.`, reservation: { ...resa, voiture } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ══════════════════════════════
// Notifications
// ══════════════════════════════
router.get("/notifications/mes", requireAuth, (req, res) => {
  try {
    const { notifications } = readNotif();
    const miennes = notifications
      .filter(n => String(n.dest_id) === String(req.user.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ success: true, notifications: miennes, nonLues: miennes.filter(n => !n.lue).length });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.put("/notifications/:id/lire", requireAuth, (req, res) => {
  try {
    const data = readNotif();
    const n = data.notifications.find(n => n.id === req.params.id && String(n.dest_id) === String(req.user.id));
    if (!n) return res.status(404).json({ success: false, error: "Introuvable." });
    n.lue = true; writeNotif(data);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.put("/notifications/tout-lire", requireAuth, (req, res) => {
  try {
    const data = readNotif();
    data.notifications.forEach(n => { if (String(n.dest_id) === String(req.user.id)) n.lue = true; });
    writeNotif(data);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
