import { Request, Response } from "express";
import { doesUsernameExist } from "../../../../database/accounts/users/user_existence";
import { KillswitchTypes } from "../../../../database/models/killswitch";
import setKillswitch from "../../../../middleware/killswitch";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";

export default [
    setKillswitch([KillswitchTypes.DISABLE_AUTH]),
    requireMethod("GET"),
    async (req: ExtendedRequest, res: Response) => {
        const username = req.query.username as string;

        if (!username) {
            res.status(400).json({ error: "Missing username" });
            return;
        }

        // Check if the username is already in use
        if (await doesUsernameExist(username)) {
            res.status(200).json({ exists: true });
            return;
        }

        res.status(404).json({ exists: false });
    },
];
