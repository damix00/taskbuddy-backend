import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethods } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import _get from "./_get";
import _delete from "./_delete";

export default [
    authorize(true),
    requireMethods(["GET", "DELETE"]),
    (req: ExtendedRequest, res: Response) => {
        if (!req.params.uuid) {
            res.status(400).json({
                error: "Missing uuid parameter",
            });
            return;
        }

        if (req.method.toUpperCase() == "GET") {
            return _get(req, res);
        }

        if (req.method.toUpperCase() == "DELETE") {
            return _delete(req, res);
        }
    },
];
