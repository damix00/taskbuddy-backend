import { DataModel } from "../../data_model";
import {
    ReviewFields,
    ReviewModel,
    ReviewType,
} from "../../models/reviews/review";
import { Profile } from "../accounts/profiles";
import { User } from "../accounts/users";
import Post from "../posts/post";
import reads from "./queries/reads";
import writes from "./queries/writes";

export default class Review extends DataModel implements ReviewModel {
    user: User;
    user_profile: Profile;
    rating_for: User;
    id: number;
    uuid: string;
    user_id: number;
    rating_for_id: number;
    post_id: number;
    post_title: string;
    rating: number;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
    following: boolean;
    type: ReviewType;

    constructor(review: ReviewFields, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        Object.assign(this, review);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const review = await reads.getReviewById(this.id);

        if (review) {
            super.setData(review);
        }
    }

    public async update(data: Partial<ReviewFields>): Promise<boolean> {
        this._refetch();

        const newReview = { ...this, ...data };

        const result = await writes.updateReview(this.id, newReview);

        if (result) {
            super.setData(result);
            return true;
        }

        return false;
    }

    public async deleteReview(): Promise<boolean> {
        const result = await writes.deleteReview(this.id);

        return result;
    }
}
