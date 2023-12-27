import { NextFunction, Request, Response } from "express";

export default function debugOnly(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (process.env.PRODUCTION_MODE == "true") {
        res.status(404).json({
            message: "Not Found",
        });
    }

    next();
}
