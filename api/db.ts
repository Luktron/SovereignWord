import type { VercelRequest, VercelResponse } from "@vercel/node";
import dbData from "../db.json";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.json(dbData);
}
