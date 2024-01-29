import Follow from ".";
import { FollowsFields } from "../../../models/users/follows";
import { Profile } from "../profiles";
import { User } from "../users";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toFollow(follow: FollowsFields | null): Follow | null {
    if (!follow) return null;

    return new Follow(follow);
}

export class FollowReads {
    static async getFollowById(id: number): Promise<Follow | null> {
        return toFollow(await reads.getFollowById(id));
    }

    static async isFollowing(
        follower: number,
        following: number
    ): Promise<boolean> {
        return await reads.isFollowing(follower, following);
    }

    static async isMutual(
        user_id: number,
        other_user_id: number
    ): Promise<boolean> {
        return await reads.isMutual(user_id, other_user_id);
    }

    static async getFriends(
        user_id: number,
        offset: number = 0
    ): Promise<
        {
            user: User;
            profile: Profile;
        }[]
    > {
        const r = await reads.getFriends(user_id, offset);

        return r.map((friend) => ({
            user: new User(friend.user),
            profile: new Profile(friend.profile),
        }));
    }
}

export class FollowWrites {
    static async follow(follower: number, following: number) {
        return await writes.follow(follower, following);
    }

    static async unfollow(follower: number, following: number) {
        return await writes.unfollow(follower, following);
    }
}
