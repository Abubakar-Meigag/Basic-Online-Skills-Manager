

import type { Request, Response } from "express";
import db from "../data/db";

const testEndPoint = (req: Request, res: Response) => {


      try {
            if (db.length === 0) {
                  res.json({ message: "No messages found" });
                  return;
            }
            res.json(db);
      } catch (error) {
            res.status(500).json({ message: "Internal server error" });
      }
}

export default testEndPoint;