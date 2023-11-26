import { writes } from "./queries/writes";
import { reads } from "./queries/reads";
import { Profile } from ".";
import { ProfileFields, ProfileModel } from "../../../models/users/profile";

function toProfile(
    profile: ProfileModel | ProfileFields | null
): Profile | null {
    if (!profile) return null;

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
