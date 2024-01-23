// POST /v1/sessions
// Create a new scroll session.

import { Response } from "express";
import { authorize } from "../../../middleware/authorization";
import { ExtendedRequest } from "../../../types/request";
import { requireMethod } from "../../../middleware/require_method";
import {
    floatParser,
    intParser,
    listParser,
} from "../../../middleware/parsers";
import { UserSessionsWrapper } from "../../../database/wrappers/algorithm/sessions_wrapper";
import { getSessionResponse } from "./responses";
import {
    LocationType,
    SessionFilters,
    SessionType,
    UrgencyType,
} from "../../../database/models/algorithm/scroll_sessions";

export default [
    requireMethod("POST"),
    authorize(true),
    floatParser(["lat", "lon"]),
    intParser(["urgency", "location", "type"]),
    listParser(["tags"]),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const filters = req.body as SessionFilters;

            for (let i = 0; i < filters.tags.length; i++) {
                if (isNaN(parseInt(filters.tags[i] as any))) {
                    res.status(400).json({
                        message: "Invalid tag id",
                    });
                    return;
                }

                filters.tags[i] = parseInt(filters.tags[i] as any);
            }

            if (!filters) {
                res.status(500).json({
                    message: "Internal server error",
                });
                return;
            }

            const session = await UserSessionsWrapper.addSession(
                req.user!.id,
                req.ip || "",
                req.body.lat,
                req.body.lon,
                JSON.stringify(filters)
            );

            if (!session) {
                res.status(500).json({
                    message: "Internal server error",
                });
                return;
            }

            res.status(200).json({
                message: "Session created",
                session: getSessionResponse(session),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
