import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const projects = [
  ["Chennai Metro Corridor Expansion", "Metro rail connectivity expansion.", "Chennai, Tamil Nadu", 850000000, 68, "ON_TRACK", "2026-01-15", "2028-12-31", "Infrastructure Development Authority"],
  ["Salem Government Hospital Modernization", "Hospital modernization and infrastructure upgrade.", "Salem, Tamil Nadu", 320000000, 54, "ON_TRACK", "2026-02-01", "2027-11-30", "Health Infrastructure Department"],
  ["Trichy Smart Traffic Management", "Intelligent traffic signals and real-time traffic monitoring.", "Tiruchirappalli, Tamil Nadu", 180000000, 42, "AT_RISK", "2026-03-10", "2027-09-30", "Smart City Mission"],
  ["Erode Solid Waste Management", "Integrated municipal solid waste management system.", "Erode, Tamil Nadu", 145000000, 31, "AT_RISK", "2026-01-20", "2027-08-31", "Erode Municipal Corporation"],
  ["Thanjavur Heritage Area Development", "Heritage area restoration and infrastructure improvement.", "Thanjavur, Tamil Nadu", 210000000, 76, "ON_TRACK", "2025-11-01", "2027-06-30", "Heritage Development Authority"],
  ["Madurai Integrated Drinking Water Project", "Drinking water pipeline and treatment infrastructure.", "Madurai, Tamil Nadu", 480000000, 61, "ON_TRACK", "2026-01-05", "2028-03-31", "Water Resources Department"],
  ["Coimbatore Smart Road Development", "Smart roads with drainage and pedestrian facilities.", "Coimbatore, Tamil Nadu", 390000000, 47, "AT_RISK", "2026-02-15", "2028-01-31", "Coimbatore Smart City"],
  ["Tirunelveli Solar Street Lighting", "Solar street lighting across urban areas.", "Tirunelveli, Tamil Nadu", 95000000, 83, "ON_TRACK", "2025-08-01", "2026-12-31", "Green Energy Corporation"],
  ["Kanyakumari Coastal Protection", "Coastal protection and shoreline strengthening.", "Kanyakumari, Tamil Nadu", 275000000, 29, "DELAYED", "2025-12-01", "2027-05-31", "Coastal Protection Department"],
  ["Tuticorin Port Infrastructure Upgrade", "Port roads, logistics and cargo infrastructure upgrade.", "Thoothukudi, Tamil Nadu", 620000000, 57, "ON_TRACK", "2026-01-10", "2028-10-31", "Tamil Nadu Port Authority"],
  ["Vellore Government School Infrastructure", "Government school renovation and modernization.", "Vellore, Tamil Nadu", 125000000, 72, "ON_TRACK", "2025-10-15", "2027-03-31", "School Education Department"],
  ["Thiruvallur Urban Drainage Improvement", "Stormwater drainage and flood prevention infrastructure.", "Thiruvallur, Tamil Nadu", 230000000, 36, "AT_RISK", "2026-03-01", "2027-12-31", "Urban Development Department"],
  ["Kanchipuram Rural Water Conservation", "Water harvesting and groundwater recharge infrastructure.", "Kanchipuram, Tamil Nadu", 110000000, 64, "ON_TRACK", "2025-09-01", "2027-02-28", "Rural Development Department"],
  ["Namakkal Bus Terminal Modernization", "Bus terminal modernization and passenger facilities.", "Namakkal, Tamil Nadu", 175000000, 48, "ON_TRACK", "2026-01-25", "2027-10-31", "Transport Infrastructure Authority"],
  ["Dindigul Smart Street Network", "Smart street infrastructure and public safety systems.", "Dindigul, Tamil Nadu", 135000000, 22, "DELAYED", "2026-02-10", "2027-07-31", "Dindigul Municipal Corporation"],
  ["Ramanathapuram Coastal Road Development", "Resilient coastal road and transport connectivity.", "Ramanathapuram, Tamil Nadu", 310000000, 44, "AT_RISK", "2025-12-15", "2028-05-31", "Highways Department"],
  ["Virudhunagar Industrial Infrastructure", "Industrial roads, drainage and utility infrastructure.", "Virudhunagar, Tamil Nadu", 285000000, 67, "ON_TRACK", "2025-07-01", "2027-12-31", "Industrial Development Corporation"],
  ["Karur Smart Water Management", "Smart water meters and distribution monitoring.", "Karur, Tamil Nadu", 160000000, 38, "AT_RISK", "2026-01-15", "2027-11-30", "Karur Municipal Corporation"],
  ["Dharmapuri Rural Road Upgrade", "Rural road connectivity improvement.", "Dharmapuri, Tamil Nadu", 205000000, 81, "COMPLETED", "2025-01-10", "2026-08-31", "Rural Roads Department"],
  ["Krishnagiri Highway Safety Project", "Road safety barriers, lighting and monitoring.", "Krishnagiri, Tamil Nadu", 260000000, 52, "ON_TRACK", "2026-01-05", "2027-12-31", "Highways Safety Authority"],
  ["Pudukkottai Municipal Infrastructure", "Municipal roads, drainage and public facilities.", "Pudukkottai, Tamil Nadu", 195000000, 27, "DELAYED", "2025-11-15", "2027-06-30", "Pudukkottai Municipality"],
  ["Nagapattinam Flood Resilience Project", "Flood mitigation and resilient drainage infrastructure.", "Nagapattinam, Tamil Nadu", 350000000, 59, "ON_TRACK", "2026-02-01", "2028-06-30", "Disaster Management Authority"],
  ["Ariyalur Rural Water Supply", "Rural drinking water supply and storage infrastructure.", "Ariyalur, Tamil Nadu", 105000000, 74, "ON_TRACK", "2025-10-01", "2027-04-30", "Water Supply Board"],
  ["Perambalur Solar Energy Infrastructure", "Solar power systems for public infrastructure.", "Perambalur, Tamil Nadu", 155000000, 91, "COMPLETED", "2025-03-01", "2026-07-31", "Renewable Energy Department"],
  ["Cuddalore Coastal Drainage Project", "Coastal drainage and flood protection infrastructure.", "Cuddalore, Tamil Nadu", 240000000, 33, "AT_RISK", "2026-01-20", "2028-02-28", "Cuddalore Municipal Corporation"],
];

async function seedProjects() {
  try {
    console.log("Connecting to PostgreSQL...");

    await pool.query('DELETE FROM "Project"');

    for (const project of projects) {
     await pool.query(
  `INSERT INTO "Project"
  (name, description, location, budget, progress, status, "startDate", "endDate", manager, "updatedAt")
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP)`,
  project
);
    }

    const result = await pool.query(
      'SELECT COUNT(*) FROM "Project"'
    );

    console.log(
      `Successfully inserted ${result.rows[0].count} projects.`
    );

  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await pool.end();
  }
}

seedProjects();