/**
 * setup-db.mjs — Bootstrap Supabase tables pour Norvika
 * Usage: node scripts/setup-db.mjs
 * Nécessite SUPABASE_URL et SUPABASE_SERVICE_KEY dans l'environnement
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_KEY requis");
  process.exit(1);
}

// Lire l'URL du projet depuis la variable
const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");

// Appliquer la migration via l'API Management (nécessite un PAT, pas le service key)
// Alternative : passer par le dashboard Supabase

const sql = readFileSync(join(__dirname, "../supabase/migration_init.sql"), "utf8");

console.log("📋 Migration SQL prête :");
console.log("─".repeat(60));
console.log(`Projet : ${projectRef}`);
console.log("─".repeat(60));
console.log("\n✅ Copier le fichier supabase/migration_init.sql dans le SQL Editor de Supabase :");
console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
console.log("\nOu fournir un Personal Access Token Supabase pour l'appliquer automatiquement :");
console.log("   https://supabase.com/dashboard/account/tokens");
