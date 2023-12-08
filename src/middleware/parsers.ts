import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../types/request";

export function intParser(fields: string[] = []) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const { body } = req;

        for (const key in body) {
            // Only parse a field if it's a string and in the list of fields
            // we want to parse.
            if (typeof body[key] === "string" && fields.includes(key)) {
                const parsed = parseInt(body[key]);

                // If the parsed value is not NaN, replace the value in the
                // body with the parsed value.
                if (!isNaN(parsed)) {
                    body[key] = parsed;
                }
            }
        }

        next();
    };
}

export function floatParser(fields: string[] = []) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const { body } = req;

        for (const key in body) {
            if (typeof body[key] === "string" && fields.includes(key)) {
                const parsed = parseFloat(body[key]);

                if (!isNaN(parsed)) {
                    body[key] = parsed;
                }
            }
        }

        next();
    };
}

export function boolParser(fields: string[] = []) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const { body } = req;

        for (const key in body) {
            if (typeof body[key] === "string" && fields.includes(key)) {
                // If the string value is "true", set the value to true.
                // If the string value is "false", set the value to false.
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
