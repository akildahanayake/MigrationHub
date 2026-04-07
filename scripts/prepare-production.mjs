import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const distRoot = path.join(repoRoot, "dist");
const backendRoot = path.join(repoRoot, "backend");

const copyIfExists = (from, to) => {
  if (!existsSync(from)) return;
  cpSync(from, to, { recursive: true, force: true });
};

if (!existsSync(distRoot)) {
  throw new Error("dist/ was not found. Run the frontend build first.");
}

mkdirSync(path.join(distRoot, "uploads"), { recursive: true });

copyIfExists(path.join(backendRoot, "api"), path.join(distRoot, "api"));
copyIfExists(path.join(backendRoot, "config"), path.join(distRoot, "config"));
copyIfExists(path.join(backendRoot, "install"), path.join(distRoot, "install"));
copyIfExists(path.join(backendRoot, "uploads", ".htaccess"), path.join(distRoot, "uploads", ".htaccess"));
copyIfExists(path.join(backendRoot, "uploads", "index.html"), path.join(distRoot, "uploads", "index.html"));
copyIfExists(path.join(backendRoot, "database.mysql.sql"), path.join(distRoot, "database.mysql.sql"));
copyIfExists(path.join(backendRoot, ".env.example"), path.join(distRoot, ".env.example"));
copyIfExists(path.join(backendRoot, ".env"), path.join(distRoot, ".env"));
copyIfExists(path.join(repoRoot, ".htaccess"), path.join(distRoot, ".htaccess"));

console.log("Prepared deployable dist/ with frontend + backend runtime files.");
