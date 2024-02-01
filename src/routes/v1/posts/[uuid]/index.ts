import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethods } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import _get from "./_get";
import _delete from "./_delete";
import _patch from "./_patch";
import { boolParser, floatParser } from "../../../../middleware/parsers";

export default [
    requireMethods(["GET", "DELETE", "PATCH"]),
    boolParser(["urgent", "reserved"]),
    floatParser(["lat", "lon"]),
    authorize(true),
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

        if (req.method.toUpperCase() == "PATCH") {
            return _patch(req, res);
        }
    },
];
