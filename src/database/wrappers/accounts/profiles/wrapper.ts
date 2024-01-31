import { writes } from "./queries/writes";
import { reads } from "./queries/reads";
import { Profile } from ".";
import { ProfileFields, ProfileModel } from "../../../models/users/profile";

function toProfile(
    profile: ProfileModel | ProfileFields | null
): Profile | null {
    if (!profile) return null;

    profile.id = parseInt(profile.id as unknown as string);
    profile.user_id = parseInt(profile.user_id as unknown as string);
    profile.followers = parseInt(profile.followers as unknown as string);
    profile.following = parseInt(profile.following as unknown as string);
    profile.post_count = parseInt(profile.post_count as unknown as string);
    profile.completed_employee = parseInt(
        profile.completed_employee as unknown as string
    );
    profile.completed_employer = parseInt(
        profile.completed_employer as unknown as string
    );
    profile.rating_count_employee = parseInt(
        profile.rating_count_employee as unknown as string
    );
    profile.rating_count_employer = parseInt(
        profile.rating_count_employer as unknown as string
    );
    profile.rating_employee = parseFloat(
        profile.rating_employee as unknown as string
    );
    profile.rating_employer = parseFloat(
        profile.rating_employer as unknown as string
    );

    return new Profile(profile);
}

export class ProfileReads {
    public static async getProfileById(
        profile_id: number
    ): Promise<Profile | null> {
        return toProfile(await reads.getProfileById(profile_id));
    }

    public static async getProfileByUid(
        user_id: number
    ): Promise<Profile | null> {
        return toProfile(await reads.getProfileByUid(user_id));
    }

    public static async getProfileByUsername(
        username: string
    ): Promise<Profile | null> {
        return toProfile(await reads.getProfileByUsername(username));
    }
}

export class ProfileWrites {
    public static async addProfile(
        profile: writes.PartialProfile
    ): Promise<Profile | null> {
        return toProfile(await writes.addProfile(profile));
    }

    public static async updateProfile(
        profile: ProfileModel | ProfileFields
    ): Promise<boolean> {
        return await writes.updateProfile(profile);
    }
}
