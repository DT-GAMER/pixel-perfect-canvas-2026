// Creates .env from .env.example with freshly generated Supabase secrets.
// Usage: npm run setup            (refuses to overwrite an existing .env)
//        npm run setup -- --force (regenerates; existing DB volumes then need `docker compose down -v`)
import { createHmac, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

if (existsSync(".env") && !process.argv.includes("--force")) {
  console.log(".env already exists. Use `npm run setup -- --force` to regenerate it.");
  process.exit(0);
}

const base64url = (input) => Buffer.from(input).toString("base64url");

function signJwt(payload, secret) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

const jwtSecret = randomBytes(32).toString("hex");
const iat = Math.floor(Date.now() / 1000);
const exp = iat + 10 * 365 * 24 * 60 * 60;
const anonKey = signJwt({ role: "anon", iss: "supabase", iat, exp }, jwtSecret);
const serviceKey = signJwt({ role: "service_role", iss: "supabase", iat, exp }, jwtSecret);

const values = {
  POSTGRES_PASSWORD: randomBytes(24).toString("hex"),
  DB_SERVICE_PASSWORD: randomBytes(24).toString("hex"),
  JWT_SECRET: jwtSecret,
  ANON_KEY: anonKey,
  SERVICE_ROLE_KEY: serviceKey,
  SUPABASE_PUBLISHABLE_KEY: anonKey,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  VITE_SUPABASE_PUBLISHABLE_KEY: anonKey,
};

const env = readFileSync(".env.example", "utf8").replace(/^([A-Z_]+)=$/gm, (line, key) =>
  key in values ? `${key}=${values[key]}` : line,
);
writeFileSync(".env", env, { mode: 0o600 });
console.log("Wrote .env with new local secrets.");
