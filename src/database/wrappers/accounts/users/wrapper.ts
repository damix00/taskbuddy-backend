import { UserFields, UserModel } from "../../../models/users/user";
import { User } from "./index";
import { reads } from "./queries/reads";
import { writes } from "./queries/writes";
import * as existence from "./queries/user_existence";
import { Profile } from "../profiles";
import { ProfileFields } from "../../../models/users/profile";

function toUser(user: UserModel | UserFields | null): User | null {
    if (!user) return null;

    return new User(user);
}

export class UserReads {
    static async getUserById(id: number): Promise<User | null> {
        return toUser(await reads.getUserById(id));
    }

    static async getUserByUUID(
        uuid: string,
        requested_by_id?: number
    ): Promise<User | null> {
        return toUser(await reads.getUserByUUID(uuid, requested_by_id));
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        return toUser(await reads.getUserByEmail(email));
    }

    static async getUserByUsername(username: string): Promise<User | null> {
        return toUser(await reads.getUserByUsername(username));
    }

    static async getUserByPhoneNumber(
        phoneNumber: string
    ): Promise<User | null> {
        return toUser(await reads.getUserByPhoneNumber(phoneNumber));
    }

    static async doesUUIDExist(uuid: string): Promise<boolean> {
        return await existence.doesUUIDExist(uuid);
    }

    static async doesEmailExist(email: string): Promise<boolean> {
        return await existence.doesEmailExist(email);
    }

    static async doesUsernameExist(username: string): Promise<boolean> {
        return await existence.doesUsernameExist(username);
    }

    static async doesPhoneNumberExist(phoneNumber: string): Promise<boolean> {
        return await existence.doesPhoneNumberExist(phoneNumber);
    }

    static async search(
        query: string,
        offset: number,
        user_id: number
    ): Promise<
        | { user: User; following: boolean; profile: Partial<ProfileFields> }[]
        | null
    > {
        const users = await reads.searchUsers(query, offset, user_id);

        if (!users) return null;

        let res: {
            user: User;
            following: boolean;
            profile: Partial<ProfileFields>;
        }[] = [];

        for (const user of users) {
            res.push({
                user: toUser(user.user)!,
                following: user.following,
                profile: {
                    profile_picture: user.profile.profile_picture,
                    bio: user.profile.bio,
                    rating_employer: user.profile.rating_employer,
                    rating_employee: user.profile.rating_employee,
                    rating_count_employer: user.profile.rating_count_employer,
                    rating_count_employee: user.profile.rating_count_employee,
                    cancelled_employer: user.profile.cancelled_employer,
                    cancelled_employee: user.profile.cancelled_employee,
                    completed_employer: user.profile.completed_employer,
                    completed_employee: user.profile.completed_employee,
                    followers: user.profile.followers,
                    following: user.profile.following,
                    post_count: user.profile.post_count,
                    location_text: user.profile.location_text,
                    location_lat: user.profile.location_lat,
                    location_lon: user.profile.location_lon,
                    is_private: user.profile.is_private,
                },
            });
        }

        return res;
    }
}

export class UserWrites {
    static async addUser(user: writes.PartialUser): Promise<User | null> {
        return toUser(await writes.addUser(user));
    }

    static async updateUser(user: UserModel): Promise<boolean> {
        return await writes.updateUser(user);
    }

    static async permaDelete(id: number): Promise<boolean> {
        return await writes.permaDelete(id);
    }
}
