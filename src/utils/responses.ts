import { UserModel } from "../database/models/user";

export function getUserResponse(user: UserModel) {
    return {
        user: {
            uuid: user.uuid,
            email: user.email,
            username: user.username,
            last_login: user.last_login,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            created_at: user.created_at
        },
        required_actions: {
            verify_email: !user.email_verified
        }
    }
}