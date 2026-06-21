import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const sourceUrl = "https://openapi.tossinvest.com/openapi-docs/latest/openapi.json";
const outputPath = fileURLToPath(new URL("../spec/upstream/openapi.json", import.meta.url));

const response = await fetch(sourceUrl, {
  headers: {
    "user-agent": "tossinvest-openapi-scaffold"
  }
});

if (!response.ok) {
  throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
}

const spec = await response.json();

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(spec, null, 2)}\n`, "utf8");

console.log(`Fetched Toss Securities OpenAPI spec to ${outputPath}`);
