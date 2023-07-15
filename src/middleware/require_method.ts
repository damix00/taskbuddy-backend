import { NextFunction, Request, Response } from "express";

export function requireMethod(method: string) {
    return function (req: Request, res: Response, next: NextFunction) {
        // Check if the method is allowed
        if (req.method !== method) {
            res.status(405).json({
                message: `Method ${req.method} not allowed`
            });
            return;
        }

        // If the method is allowed, call the next middleware
        next();
    };
}

export function requireMethods(methods: string[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        // Check if the method is allowed
        if (!methods.includes(req.method)) {
            res.status(405).json({
                message: `Method ${req.method} not allowed`
            });
            return;
        }

        // If the method is allowed, call the next middleware
        next();
    };
}