import { NextFunction, Response } from "express";
import { ScrollSessionFields } from "../../../database/models/algorithm/scroll_sessions";
import { ExtendedRequest } from "../../../types/request";
import { UserSessionsWrapper } from "../../../database/wrappers/algorithm/sessions_wrapper";

export interface SessionRequest extends ExtendedRequest {
    session?: ScrollSessionFields;
}

export async function withSession(
    req: SessionRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(400).json({
                message: "Invalid session ID",
            });
            return;
        }

        const session = await UserSessionsWrapper.getSession(id);

        if (!session || session.user_id != req.user!.id) {
            res.status(404).json({
                message: "Session not found",
            });
            return;
        }

        req.session = session;

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}
