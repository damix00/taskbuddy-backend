import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../types/request";

interface Options {
    ignore: string[];
}

export function floatParser(options: Options = { ignore: [] }) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const { body } = req;

        for (const key in body) {
            if (
                typeof body[key] === "string" &&
                !options.ignore.includes(key)
            ) {
                const parsed = parseFloat(body[key]);

                if (!isNaN(parsed)) {
                    body[key] = parsed;
                }
            }
        }

        next();
    };
}

export function boolParser(options: Options = { ignore: [] }) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const { body } = req;

        for (const key in body) {
            if (
                typeof body[key] === "string" &&
                !options.ignore.includes(key)
            ) {
                if (body[key] == "true") {
                    body[key] = true;
                } else if (body[key] == "false") {
                    body[key] = false;
                }
            }
        }

        next();
    };
}
