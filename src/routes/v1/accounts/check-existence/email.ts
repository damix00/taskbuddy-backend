import { Request, Response } from "express";
import { doesEmailExist } from "../../../../database/accounts/users/user_existence";
import { KillswitchTypes } from "../../../../database/models/killswitch";
import setKillswitch from "../../../../middleware/killswitch";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";

export default [
    setKillswitch([KillswitchTypes.DISABLE_AUTH]),
    requireMethod("GET"),
    async (req: ExtendedRequest, res: Response) => {
        const email = req.query.email as string;

        if (!email) {
            res.status(400).json({ error: "Missing email" });
            return;
        }

        // Check if the email is already in use
        if (await doesEmailExist(email)) {
            res.status(200).json({ exists: true });
            return;
        }

        res.status(404).json({ exists: false });
    },
];
