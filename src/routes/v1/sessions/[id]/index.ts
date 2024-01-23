// GET /v1/sessions/:id
// Get a scroll session.

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { SessionRequest, withSession } from "../middleware";
import { getSessionResponse } from "../responses";

export default [
    requireMethod("GET"),
    authorize(true),
    withSession,
    async (req: SessionRequest, res: Response) => {
        try {
            res.status(200).json({
                message: "Session found",
                session: getSessionResponse(req.session!),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
