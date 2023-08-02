import { NextFunction, Response } from 'express';
import { getUserById } from '../database/accounts/users/reads';
import { verifyToken } from '../jwt/jwt';
import { ExtendedRequest } from '../types/request';
import { User } from '../database/accounts/users';
import { UserModel } from '../database/models/user';

// Middleware to authorize a user
export async function authorize(req: any, res: any, next: any) {
    // Get the token from the headers
    const token = req.headers["authorization"];

    // If no token, return error
    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }

    // Split the token
    const split = token.split(' ');

    // If the split is not of length 2 or the first item is not 'Bearer', return error
    if (split.length !== 2 || split[0] !== 'Bearer') {
        return res.status(401).json({
            message: 'Invalid token format'
        });
    }

    // Get the bearer token
    const bearer = split[1];

    // Try to verify the token
    try {
        const decoded = verifyToken(bearer);

        // Get the user by the user ID
        let user: UserModel | null = await getUserById(decoded.id);

        // If there is no user, return error
        if (!user) {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

        user = new User(user);

        // If the user is allowed to login, the password hashes match, the emails match
        // and the token versions match, set the req.user to the user
        if (
        !user.hasDisabledAccess('disabled_login') &&
        decoded.password_hash == user.password_hash &&
        decoded.email == user.email &&
        decoded.token_version == user.token_version &&
        decoded.phone_number == user.phone_number &&
        !user.deleted) {
            req.user = user;
            
            // Call next to continue to the next middleware
            next();
        }

        else {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

    }
    catch (e) {
        console.log(e);
        return res.status(401).json({
            message: 'Invalid token'
        });
    }

}

// Require verified phone number and email
export async function requireVerifiedInfo(req: ExtendedRequest, res: Response, next: NextFunction) {
    const user = req.user;

    // If the user is not verified, return error
    if (user.email_verified || user.phone_number_verified) {
        next();
        return;
    }

    return res.status(403).json({
        message: 'Forbidden',
        required_actions: {
            verify_email: !user.email_verified,
            verify_phone_number: !user.phone_number_verified
        }
    });
}

export async function requireAdmin(req: ExtendedRequest, res: Response, next: NextFunction) {
    const user = req.user;

    // If the user is not an admin, return error
    if (!user.isAdmin()) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    // Call next to continue to the next middleware
    next();
}

type RequireOption = {
    field: string,
    value: any,
};

export async function requireOption(options: RequireOption[]) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        for (const option of options) {
            // If the user does not have the required field, return error
            // @ts-ignore
            if (user[option.field] != option.value) {
                return res.status(403).json({
                    message: 'Forbidden'
                });
            }
        }

        // Call next to continue to the next middleware
        next();
    }
}