import { KillswitchTypes } from "../database/models/killswitch";
import * as killswitches from "../utils/global_killswitches";
import { NextFunction, Request, Response } from "express";

export default function setKillswitch(ks: KillswitchTypes[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const k of ks) {
            if (killswitches.isKillswitchEnabled(k)) {
                return res.status(503).json({
                    error: "Service Unavailable",
                    message: "This service is currently unavailable.",
                });
            }
        }

        next();
    };
}
