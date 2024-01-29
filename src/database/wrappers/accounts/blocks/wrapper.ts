import Block from ".";
import { BlocksFields } from "../../../models/users/blocks";
import { UserFields } from "../../../models/users/user";
import { Profile } from "../profiles";
import { User } from "../users";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toBlock(block: BlocksFields | null): Block | null {
    if (!block) return null;

    return new Block(block);
}

export class BlockReads {
    static async getBlockById(id: number): Promise<Block | null> {
        return toBlock(await reads.getBlockById(id));
    }

    static async isBlocked(blocker: number, blocked: number): Promise<boolean> {
        return await reads.isBlocked(blocker, blocked);
    }

    static async getBlocks(
        user_id: number,
        offset: number = 0,
        limit: number = 20
    ): Promise<
        {
            user: User;
            profile: Profile;
        }[]
    > {
        const r = await reads.getBlocks(user_id, offset, limit);

        if (!r) return [];

        return r.map((block) => ({
            user: new User(block.user),
            profile: new Profile(block.profile),
        }));
    }

    static async isEitherBlocked(
        user1: number,
        user2: number
    ): Promise<boolean> {
        return await reads.isEitherBlocked(user1, user2);
    }
}

export class BlockWrites {
    static async block(blocker: number, blocked: number) {
        return await writes.block(blocker, blocked);
    }

    static async unblock(blocker: number, blocked: number) {
        return await writes.unblock(blocker, blocked);
    }
}
