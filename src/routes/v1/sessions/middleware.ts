import { NextFunction, Response } from "express";
import { ScrollSessionFields } from "../../../database/models/algorithm/scroll_sessions";
import { ExtendedRequest } from "../../../types/request";
import { UserSessionsWrapper } from "../../../database/wrappers/algorithm/sessions_wrapper";

export interface SessionRequest extends ExtendedRequest {
    session?: ScrollSessionFields;
    loaded_post_ids?: number[];
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

        const loaded_post_ids = await UserSessionsWrapper.getSessionPosts(id);

        if (loaded_post_ids === null) {
            console.error("Failed to load posts for session");

            res.status(500).json({
                message: "Internal server error",
            });
            return;
        }

        req.session = session;
        req.loaded_post_ids = loaded_post_ids;

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}
