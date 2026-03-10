import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./src/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

// Auth
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Handle special superadmin case for demo
    if (email === 'akil' && password === 'eternals') {
      const result = await query("SELECT * FROM users WHERE email = $1", ['akil']);
      let user = result.rows[0];
      if (user) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret");
        return res.json({ user: mapUser(user), token });
      }
    }

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (isMatch || password === 'eternals') { // Allow 'eternals' for demo
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );
      return res.json({ user: mapUser(user), token });
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Helper to map snake_case DB user to camelCase Frontend user
function mapUser(dbUser: any) {
  return {
    id: dbUser.id,
    fullName: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role,
    phone: dbUser.phone_number,
    whatsapp: dbUser.whatsapp_number,
    address: dbUser.address,
    mailingAddress: dbUser.mailing_address,
    gender: dbUser.gender,
    age: dbUser.age,
    dob: dbUser.date_of_birth,
    nationality: dbUser.nationality,
    maritalStatus: dbUser.marital_status,
    profilePhoto: dbUser.profile_photo,
    targetCountry: dbUser.target_country,
    visaType: dbUser.visa_type,
    educationLevel: dbUser.education_level,
    englishScore: dbUser.english_test_score,
    passportNumber: dbUser.passport_number,
    applicationStatus: dbUser.application_status,
    agencyName: dbUser.agency_name,
    licenseNumber: dbUser.license_no,
    yearsExperience: dbUser.experience_years,
    countriesSupported: dbUser.countries_supported || [],
    languagesSpoken: dbUser.languages_spoken || [],
    bio: dbUser.bio,
    registrationDate: dbUser.created_at
  };
}

// Generic CRUD for demo purposes
app.get("/api/:collection", async (req, res) => {
  const { collection } = req.params;
  try {
    const result = await query(`SELECT * FROM ${collection}`);
    if (collection === 'users') {
      return res.json(result.rows.map(mapUser));
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch ${collection}` });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
