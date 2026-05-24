import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const dbPath = path.join(process.cwd(), "db.json");
    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar banco de dados" });
  }
}
