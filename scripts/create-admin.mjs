// Creates (or promotes) a staff account. Use it for the first admin; after that,
// admins can invite people from the dashboard's Team page.
//
//   npm run admin:create -- you@example.com "Your Name" [admin|editor]
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env (stack must be running).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key, rest.join("=").replace(/^"(.*)"$/, "$1")];
    }),
);

const [email, fullName = null, role = "admin"] = process.argv.slice(2);
if (!email || !/^\S+@\S+\.\S+$/.test(email) || !["admin", "editor"].includes(role)) {
  console.error('Usage: npm run admin:create -- you@example.com "Your Name" [admin|editor]');
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let userId;
const created = await supabase.auth.admin.createUser({ email, email_confirm: true });
if (created.data.user) {
  userId = created.data.user.id;
} else if (created.error?.code === "email_exists") {
  for (let page = 1; !userId; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    userId = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id;
    if (data.users.length < 1000) break;
  }
} else {
  throw created.error;
}
if (!userId) throw new Error(`Could not find or create a user for ${email}`);

const { error } = await supabase
  .from("profiles")
  .upsert(
    { id: userId, email: email.toLowerCase(), full_name: fullName, role },
    { onConflict: "id" },
  );
if (error) throw error;

console.log(`${email} is now ${role === "admin" ? "an admin" : "an editor"}.`);
console.log(`Sign in at ${env.SITE_URL ?? "http://localhost:3000"}/admin/login`);
