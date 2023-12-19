import { Response } from "express";
import { ExtendedRequest } from "../../../../types/request";

export default (req: ExtendedRequest, res: Response) => {
    res.status(200).json({
        uuid: req.params.uuid,
    });
};
