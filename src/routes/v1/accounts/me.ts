// Get the current user's information

import { Response } from "express";
import { authorize } from "../../../middleware/authorization";
import {
    getUserProfileResponse,
    getUserResponse,
} from "../../../utils/responses";
import { ExtendedRequest } from "../../../types/request";
import setKillswitch from "../../../middleware/killswitch";
import { KillswitchTypes } from "../../../database/models/killswitch";

export default [
    setKillswitch([KillswitchTypes.DISABLE_AUTH]),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        res.status(200).json(getUserProfileResponse(req.user, req.profile!));
    },
];
