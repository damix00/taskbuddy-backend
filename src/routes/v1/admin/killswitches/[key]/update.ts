import { Response } from "express";
import {
    authorize,
    requireAdmin,
} from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import { requireMethods } from "../../../../../middleware/require_method";
import { setKillswitch } from "../../../../../database/wrappers/killswitches/writes";

export default [
    authorize(true),
    requireAdmin,
    requireMethods(["POST", "PUT", "UPDATE"]),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { key } = req.params;

            if (!key) {
                return res.status(400).json({
                    message: "Missing key",
                });
            }

            const { enabled, description } = req.body;

            if (
                typeof enabled !== "boolean" ||
                typeof description !== "string"
            ) {
                return res.status(400).json({
                    message: "Invalid values",
                });
            }

            const killswitch = await setKillswitch({
                type: key,
                enabled,
                description,
                added_by: req.user!.id,
            });

            if (!killswitch) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            res.status(200).json({
                message: "Killswitch updated",
                killswitch: {
                    id: killswitch.id,
                    type: killswitch.type,
                    description: killswitch.description,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
