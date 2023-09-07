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
        try {
            const username = req.query.username as string;
            const email = req.query.email as string;
            const phoneNumber = req.query.phoneNumber as string;

            const resp: {
                username?: boolean;
                email?: boolean;
                phoneNumber?: boolean;
            } = {};

            if (username) {
                resp.username = await doesUsernameExist(username);
            }

            if (email) {
                resp.email = await doesUsernameExist(email);
            }

            if (phoneNumber) {
                resp.phoneNumber = await doesUsernameExist(phoneNumber);
            }

            res.status(200).json(resp);
        } catch (err) {
            res.status(500).json({
                error: "Internal Server Error",
            });
        }
    },
];
