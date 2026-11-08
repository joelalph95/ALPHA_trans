const express = require("express");
const router  = express.Router();
const fs      = require("fs");
const path    = require("path");

const FILE = path.join(__dirname, "../data/voitures.json");
const read  = ()  => JSON.parse(fs.readFileSync(FILE, "utf-8"));
const write = (d) => fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
const genId = ()  => "V" + Date.now().toString(36).toUpperCase();

// GET /api/voitures
router.get("/", (req, res) => {
  try { res.json({ success: true, voitures: read().voitures }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// POST /api/voitures
router.post("/", (req, res) => {
  try {
    const { immatriculation, marque, modele, capacite, chauffeur, ligne, tarif_place, heure_depart } = req.body;
    if (!immatriculation || !marque || !modele || !capacite)
      return res.status(400).json({ success: false, error: "Champs obligatoires manquants." });
    const data = read();
    if (data.voitures.find(v => v.immatriculation.toUpperCase() === immatriculation.toUpperCase()))
      return res.status(409).json({ success: false, error: "Immatriculation déjà enregistrée." });
    const v = {
      id: genId(), immatriculation: immatriculation.toUpperCase().trim(),
      marque: marque.trim(), modele: modele.trim(), capacite: parseInt(capacite),
      statut: "disponible", chauffeur: chauffeur?.trim() || "", chauffeur_id: "",
      ligne: ligne?.trim() || "", tarif_place: parseInt(tarif_place) || 0,
      heure_depart: heure_depart || "", created_at: new Date().toISOString(),
    };
    data.voitures.push(v);
    write(data);
    res.status(201).json({ success: true, message: "Voiture ajoutée.", voiture: v });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// PUT /api/voitures/:id
router.put("/:id", (req, res) => {
  try {
    const data = read();
    const i = data.voitures.findIndex(v => v.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, error: "Voiture introuvable." });
    const v = data.voitures[i];
    ["immatriculation","marque","modele","statut","chauffeur","chauffeur_id","ligne","heure_depart"].forEach(f => {
      if (req.body[f] !== undefined) v[f] = req.body[f];
    });
    ["capacite","tarif_place"].forEach(f => { if (req.body[f] !== undefined) v[f] = parseInt(req.body[f]); });
    v.updated_at = new Date().toISOString();
    write(data);
    res.json({ success: true, voiture: v });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE /api/voitures/:id
router.delete("/:id", (req, res) => {
  try {
    const data = read();
    const i = data.voitures.findIndex(v => v.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, error: "Voiture introuvable." });
    const [removed] = data.voitures.splice(i, 1);
    write(data);
    res.json({ success: true, voiture: removed });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
