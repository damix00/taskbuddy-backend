import { KillswitchTypes } from "../../database/models/killswitch";
import * as killswitches from "../../utils/global_killswitches";
import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
    if (
        (killswitches.isKillswitchEnabled(KillswitchTypes.DISABLE_ROUTES) ||
            killswitches.isKillswitchEnabled(KillswitchTypes.DISABLE_ALL)) &&
        !req.path.startsWith("/v1/admin")
    ) {
        return res.status(503).json({
            message: "Service Unavailable",
        });
    }
    next();
};
