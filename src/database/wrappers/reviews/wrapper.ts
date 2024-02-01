import Review from ".";
import {
    CreateReviewFields,
    ReviewWithRelations,
} from "../../models/reviews/review";
import { Profile } from "../accounts/profiles";
import { User } from "../accounts/users";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toReview(review: ReviewWithRelations | null): Review | null {
    if (review === null) return null;

    // Convert number fields to int because javascript is stupid
    review.id = parseInt(review.id.toString());
    review.user_id = parseInt(review.user_id.toString());
    review.rating_for_id = parseInt(review.rating_for_id.toString());
    review.post_id = parseInt(review.post_id.toString());
    review.rating_for = new User(review.rating_for);
    review.user_profile = new Profile(review.user_profile);
    review.rating = parseFloat(review.rating.toString());

    return new Review(review);
}

export interface ReviewsForUser {
    written: Review[];
    received: Review[];
}

export class ReviewReads {
    static async getReviewById(id: number): Promise<Review | null> {
        return toReview(await reads.getReviewById(id));
    }

    static async getReviewByUUID(uuid: string): Promise<Review | null> {
        return toReview(await reads.getReviewByUUID(uuid));
    }

    static async getReviewsForUser(
        user_id: number,
        requested_by_id: number,
        offset: number = 0,
        type: number = 0
    ): Promise<ReviewsForUser | null> {
        const reviews = await reads.getReviewsForUser(
            user_id,
            requested_by_id,
            offset,
            type
        );

        if (!reviews) return null;

        return {
            written: reviews.written.map((review) => toReview(review)!),
            received: reviews.received.map((review) => toReview(review)!),
        };
    }
}

export class ReviewWrites {
    static async createReview(
        data: CreateReviewFields
    ): Promise<Review | null> {
        return toReview(await writes.createReview(data));
    }

    static async updateReview(
        id: number,
        data: Partial<CreateReviewFields>
    ): Promise<boolean> {
        return await writes.updateReview(id, data);
    }

    static async deleteReview(id: number): Promise<boolean> {
        return await writes.deleteReview(id);
    }

    static async deleteUserReviews(user_id: number): Promise<boolean> {
        return await writes.deleteUserReviews(user_id);
    }
}
