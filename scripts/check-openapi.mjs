import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const specPath = fileURLToPath(new URL("../spec/upstream/openapi.json", import.meta.url));
const raw = await readFile(specPath, "utf8");
const spec = JSON.parse(raw);

const failures = [];

if (typeof spec.openapi !== "string" || !spec.openapi.startsWith("3.")) {
  failures.push("OpenAPI version must be a 3.x document");
}

if (spec.info?.title !== "토스증권 Open API") {
  failures.push("OpenAPI title must match Toss Securities Open API");
}

if (!Array.isArray(spec.servers) || spec.servers[0]?.url !== "https://openapi.tossinvest.com") {
  failures.push("OpenAPI server must be https://openapi.tossinvest.com");
}

if (!spec.paths || typeof spec.paths !== "object" || Object.keys(spec.paths).length === 0) {
  failures.push("OpenAPI paths must not be empty");
}

if (!spec.paths?.["/oauth2/token"]?.post) {
  failures.push("OpenAPI spec must include POST /oauth2/token");
}

if (!spec.components?.securitySchemes?.oauth2ClientCredentials) {
  failures.push("OpenAPI spec must include oauth2ClientCredentials security scheme");
}

if (failures.length > 0) {
  throw new Error(`OpenAPI spec check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}

console.log(`OpenAPI spec check passed: ${spec.info.version}, ${Object.keys(spec.paths).length} paths`);
