// GET/DELETE/PATCH /v1/channels/:uuid/messages/:message_uuid
// Returns, deletes, or edits a message from a channel

import { Response } from "express";
import { authorize } from "../../../../../../middleware/authorization";
import { requireMethods } from "../../../../../../middleware/require_method";
import { withChannel } from "../../middleware";
import { MessageRequest, withMessage } from "./middleware";
import { getMessageResponse } from "../../../responses";
import _delete from "./_delete";

export default [
    requireMethods(["GET", "PATCH", "DELETE"]),
    authorize(false),
    withChannel,
    withMessage,
    (req: MessageRequest, res: Response) => {
        try {
            if (req.method == "GET") {
                res.status(200).json({
                    message: getMessageResponse(
                        req.message!,
                        req.user!,
                        req.channel!.uuid
                    ),
                });
            } else if (req.method == "DELETE") {
                _delete(req, res);
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
];
