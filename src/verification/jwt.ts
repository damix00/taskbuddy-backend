import jwt from "jsonwebtoken";

export type UserPayload = {
    id: number; // User ID
    uuid: string; // Unique identifier
    email: string; // Email address
    phone_number: string; // Phone number
    username: string; // Username
    token_version: number; // Token version
    created_at: Date; // Creation date
};

export function signToken(payload: UserPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
    });
}

export function verifyToken(token: string): UserPayload {
    return jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
}

export function toUserPayload(user: UserPayload): UserPayload {
    return {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        phone_number: user.phone_number,
        username: user.username,
        token_version: user.token_version,
        created_at: user.created_at,
    };
}
