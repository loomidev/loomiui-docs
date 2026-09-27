// Serves /version.json with the version this build documents. deploy.yml reads it
// off the live site to tell whether a deploy starts a new version line, in which
// case the outgoing build is archived first.
import { CURRENT_VERSION } from "../lib/versions.mjs";

export const GET = () =>
  new Response(JSON.stringify({ version: CURRENT_VERSION }) + "\n", {
    headers: { "Content-Type": "application/json" },
  });
