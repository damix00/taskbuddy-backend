import Block from ".";
import { BlocksFields } from "../../../models/users/blocks";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toBlock(follow: BlocksFields | null): Block | null {
    if (!follow) return null;

    return new Block(follow);
}

export class BlockReads {
    static async getFollowById(id: number): Promise<Block | null> {
        return toBlock(await reads.getBlockById(id));
    }

    static async isBlocked(blocker: number, blocked: number): Promise<boolean> {
        return await reads.isBlocked(blocker, blocked);
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
