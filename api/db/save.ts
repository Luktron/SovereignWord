import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // Vercel has an ephemeral, read-only filesystem — changes are kept in
  // React state on the client for the duration of the session.
  res.json({ success: true });
}
