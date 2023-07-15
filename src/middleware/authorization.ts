import { getUserById } from '../database/accounts/users';
import { verifyToken } from '../jwt/jwt';

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
    const split = token.split('');

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
        const user = await getUserById(decoded.id);

        // If there is no user, return error
        if (!user) {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

        // If the user is allowed to login, the password hashes match, the emails match
        // and the token versions match, set the req.user to the user
        if (
            user.allow_login &&
            decoded.password_hash == user.password_hash &&
            decoded.email == user.email &&
            decoded.token_version == user.token_version &&
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

export async function requireAdmin(req: any, res: any, next: any) {
    // @ts-ignore
    const user = req.user;

    // If the user is not an admin, return error
    if (!user.is_admin) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    // Call next to continue to the next middleware
    next();
}