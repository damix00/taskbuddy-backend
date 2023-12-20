import { DataModel } from "../../../data_model";
import { BlocksFields, BlocksModel } from "../../../models/users/blocks";
import reads from "./queries/reads";
import writes from "./queries/writes";

class Block extends DataModel implements BlocksModel {
    id: number;
    blocker: number;
    blocked: number;
    created_at: Date;

    constructor(block: BlocksFields, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        // Set the login's data
        Object.assign(this, block);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const result = await reads.getBlockById(this.id);

        if (!result) throw new Error("Block not found");

        super.setData(result);
    }

    public async update(data: Partial<BlocksModel>): Promise<boolean> {
        this._refetch();

        const newBlock = { ...this, ...data };

        const r = await writes.updateBlock(newBlock);

        if (r) {
            super.setData(newBlock);
            return true;
        }

        return false;
    }

    // Unblocks a user
    public async unblock(): Promise<boolean> {
        this._refetch();

        const r = await writes.unblock(this.blocker, this.blocked);

        if (r) {
            super.setData({ ...this, id: null });
            return true;
        }

        return false;
    }
}

export default Block;
