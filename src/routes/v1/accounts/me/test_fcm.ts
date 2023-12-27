import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import { requireMethod } from "../../../../middleware/require_method";

export default [
    requireMethod("POST"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { title, body } = req.body;

            if (!title || !body) {
                return res
                    .status(400)
                    .json({ message: "Invalid request body" });
            }

            const r = await req.user!.sendNotification({
                title,
                body,
            });

            if (!r) {
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }

            res.status(200).json({ message: "Notification sent" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
];
