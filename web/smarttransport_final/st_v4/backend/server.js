require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const path    = require("path");

const { testConnection }    = require("./config/db");
const { CityModel, RouteModel, HistoryModel, KnapsackModel } = require("./models/index");
const { astar, baseline }   = require("./algorithms/astar");
const { knapsack, generatePassengers } = require("./algorithms/knapsack");
const authRoutes         = require("./routes/auth");
const voituresRoutes     = require("./routes/voitures");
const reservationsRoutes = require("./routes/reservations");

const app  = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use("/api/auth",         authRoutes);
app.use("/api/voitures",     voituresRoutes);
app.use("/api/reservations", reservationsRoutes);

let useMysql = false;
let jsonData  = JSON.parse(fs.readFileSync(path.join(__dirname,"data/routes.json"),"utf-8"));
async function getCities() { return useMysql ? CityModel.getAll() : jsonData.cities; }
async function getRoutes()  { return useMysql ? RouteModel.getAll() : jsonData.routes; }
async function getDataForAlgo() {
  const [cities,routes]=await Promise.all([getCities(),getRoutes()]);
  return {cities,routes};
}

app.get("/api/cities",async(req,res)=>{try{res.json({success:true,cities:await getCities()});}catch(e){res.status(500).json({success:false,error:e.message});}});
app.get("/api/routes",async(req,res)=>{try{res.json({success:true,routes:await getRoutes()});}catch(e){res.status(500).json({success:false,error:e.message});}});
app.get("/api/stats",async(req,res)=>{
  try{
    let stats;
    if(useMysql){const dbStats=await RouteModel.getStats();const cities=await getCities();stats={totalCities:cities.length,totalRoutes:parseInt(dbStats.total),openRoutes:parseInt(dbStats.open_count),closedRoutes:parseInt(dbStats.closed_count),avgDistance:parseInt(dbStats.avg_distance),networkHealth:Math.round((dbStats.open_count/dbStats.total)*100),dataSource:"MySQL"};}
    else{const open=jsonData.routes.filter(r=>r.status==="open").length;const closed=jsonData.routes.filter(r=>r.status==="closed").length;stats={totalCities:jsonData.cities.length,totalRoutes:jsonData.routes.length,openRoutes:open,closedRoutes:closed,avgDistance:Math.round(jsonData.routes.reduce((s,r)=>s+r.distance,0)/jsonData.routes.length),networkHealth:Math.round((open/jsonData.routes.length)*100),dataSource:"JSON (fallback)"};}
    res.json({success:true,stats});
  }catch(e){res.status(500).json({success:false,error:e.message});}
});
app.post("/api/route/optimize",async(req,res)=>{
  const{from,to,trafficLevel=0}=req.body;
  if(!from||!to)return res.status(400).json({success:false,error:"Villes requises"});
  if(from===to)return res.status(400).json({success:false,error:"Départ et arrivée identiques"});
  try{const data=await getDataForAlgo();const optimized=astar(from,to,data,parseInt(trafficLevel));const base=baseline(from,to,data);if(!optimized.found)return res.status(404).json({success:false,error:"Aucun chemin trouvé"});if(useMysql)await HistoryModel.save({fromCity:from,toCity:to,trafficLevel,result:optimized}).catch(()=>{});res.json({success:true,optimized,baseline:base,comparison:{distanceSaved:base.totalDistance-optimized.totalDistance,timeSaved:Math.round((base.totalTime-optimized.totalTime)*10)/10,fuelSaved:base.totalFuel-optimized.totalFuel,speedup:base.executionTime>0?Math.round((base.executionTime/Math.max(optimized.executionTime,1))*10)/10:1},dataSource:useMysql?"MySQL":"JSON"});}catch(e){res.status(500).json({success:false,error:e.message});}
});
app.post("/api/route/recalculate",async(req,res)=>{
  const{from,to,closedRoutes=[]}=req.body;
  try{const data=await getDataForAlgo();const tempData=JSON.parse(JSON.stringify(data));closedRoutes.forEach(cr=>{tempData.routes.forEach(r=>{if((r.from===cr.from&&r.to===cr.to)||(r.from===cr.to&&r.to===cr.from))r.status="closed";});});const result=astar(from,to,tempData,0);if(!result.found)return res.status(404).json({success:false,error:"Aucun chemin alternatif disponible"});res.json({success:true,result,closedRoutes});}catch(e){res.status(500).json({success:false,error:e.message});}
});
app.post("/api/knapsack",async(req,res)=>{
  const{capacity=15,passengerCount=12}=req.body;
  try{const passengers=generatePassengers(parseInt(passengerCount));const result=knapsack(parseInt(capacity),passengers);if(useMysql)await KnapsackModel.save({capacity,passengers,result}).catch(()=>{});res.json({success:true,capacity,passengers,result,dataSource:useMysql?"MySQL":"JSON"});}catch(e){res.status(500).json({success:false,error:e.message});}
});

async function start(){
  useMysql=await testConnection();
  app.listen(PORT,()=>{
    console.log(`\n🚐 SmartTransport 2035 — http://localhost:${PORT}`);
    console.log(`   Source : ${useMysql?"✅ MySQL":"⚠️  JSON (fallback)"}`);
    console.log(`   POST /api/reservations       — Créer réservation`);
    console.log(`   PUT  /api/reservations/:id/statut — Confirmer/Refuser`);
    console.log(`   GET  /api/reservations/notifications/mes — Mes notifs\n`);
  });
}
start();
