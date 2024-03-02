import { Socket } from "socket.io";
import { User } from "../database/wrappers/accounts/users";
import { verifyToken } from "../verification/jwt";
import { LoginReads } from "../database/wrappers/accounts/logins/wrapper";
import { LimitedAccess } from "../database/models/users/user";

export default async function authorizeSocket(
    token: string
): Promise<User | null> {
    try {
        if (!token) return null;

        // Split the token
        const split = token.split(" ");

        // If the split is not of length 2 or the first item is not 'Bearer', return error
        if (split.length !== 2 || split[0] !== "Bearer") return null;

        const bearer = split[1];

        try {
            const decoded = verifyToken(bearer);

            // Get the user by the user ID
            let user: User | null = await User.createInstance(decoded.id);

            // If there is no user, return error
            if (!user) return null;

            if (!decoded.login_id) return null;

            if (!LoginReads.getLoginById(decoded.login_id)) return null;

            if (
                !user.hasDisabledAccess(LimitedAccess.SUSPENDED) &&
                decoded.email == user.email &&
                decoded.token_version == user.token_version &&
                decoded.phone_number == user.phone_number &&
                !user.deleted
            ) {
                return user;
            }

            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}
