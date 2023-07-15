import { User } from "../database/accounts/users";

export function getUserResponse(user: User) {
    return {
        user: {
            uuid: user.uuid,
            email: user.email,
            phone_number: user.phone_number,
            phone_number_verified: user.phone_number_verified,
            last_login: user.last_login,
            first_name: user.first_name,
            last_name: user.last_name,
            is_admin: user.is_admin,
            created_at: user.created_at
        },
        required_actions: {
            verify_phone: !user.phone_number_verified
        }
    }
}