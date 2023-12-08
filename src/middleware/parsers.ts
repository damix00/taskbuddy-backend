import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../types/request";

function parser(
    fields: string[],
    canParse: (value: string) => boolean,
    parser: (value: string) => any
) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const { body } = req;

        for (const key in body) {
            if (
                typeof body[key] === "string" &&
                canParse(body[key]) &&
                fields.includes(key)
            ) {
                body[key] = parser(body[key]);
            }
        }

        next();
    };
}

export function intParser(fields: string[] = []) {
    return parser(
        fields,
        (value: string) => {
            return !isNaN(parseInt(value));
        },
        parseInt
    );
}

export function floatParser(fields: string[] = []) {
    return parser(
        fields,
        (value: string) => {
            return !isNaN(parseFloat(value));
        },
        parseFloat
    );
}

export function boolParser(fields: string[] = []) {
    return parser(
        fields,
        (value: string) => {
            return value == "true" || value == "false";
        },
        (value: string) => {
            if (value === "true") {
                return true;
            } else if (value === "false") {
                return false;
            }

            return value;
        }
    );
}

export function listParser(fields: string[] = []) {
    return parser(
        fields,
        (value: string) => {
            return value.startsWith("[") && value.endsWith("]");
        },
        (value: string) => {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
    );
}
