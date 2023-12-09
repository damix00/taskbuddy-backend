import { DataModel } from "../../../data_model";
import { FollowsFields, FollowsModel } from "../../../models/users/follows";
import reads from "./queries/reads";
import writes from "./queries/writes";

class Follow extends DataModel implements FollowsModel {
    id: number;
    follower: number;
    following: number;
    created_at: Date;

    constructor(follow: FollowsFields, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        // Set the login's data
        Object.assign(this, follow);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const result = await reads.getFollowById(this.id);

        if (!result) throw new Error("Follow not found");

        super.setData(result);
    }

    public async update(data: Partial<FollowsModel>): Promise<boolean> {
        this._refetch();

        const newFollow = { ...this, ...data };

        const r = await writes.updateFollow(newFollow);

        if (r) {
            super.setData(newFollow);
            return true;
        }

        return false;
    }

    public async unfollow(): Promise<boolean> {
        return await writes.unfollow(this.follower, this.following);
    }

    public async isMutual(): Promise<boolean> {
        return await reads.isMutual(this.follower, this.following);
    }
}

export default Follow;
