import { Profile } from "../../../database/wrappers/accounts/profiles";
import { User } from "../../../database/wrappers/accounts/users";
import Post from "../../../database/wrappers/posts/post";
import { getProfileResponse } from "../accounts/responses";

export function getPostResponse(
    post: Post, // Post to return
    user: User, // User who posted
    profile: Profile, // Profile of the user who posted
    isFollowing: boolean,
    isMe: boolean,
    liked: boolean,
    bookmarked: boolean
) {
    return {
        uuid: post.uuid,
        title: post.title,
        description: post.description,
        liked,
        bookmarked,
        display_location: {
            lat: post.approx_lat,
            lon: post.approx_lon,
            location_name: post.location_name,
        },
        // If the user is the owner of the post, send the true location
        true_location: {
            lat: isMe ? post.lat : null,
            lon: isMe ? post.lon : null,
        },
        job_type: post.job_type,
        is_remote: post.remote,
        price: post.price,
        start_date: post.start_date,
        end_date: post.end_date,
        reserved: !!post.reserved_by,
        tags: post.tags.map((tag) => tag.tag_id),
        media: post.media.map((media) => ({
            media: media.media,
            media_type: media.media_type,
        })),
        is_urgent: post.urgent,
        status: post.status,
        created_at: post.created_at,
        updated_at: post.updated_at,
        analytics: {
            likes: post.likes,
            impressions: post.impressions,
            shares: post.shares,
            bookmarks: post.bookmarks,
            comments: post.comments,
        },
        user: {
            uuid: post.user_uuid,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            is_following: isFollowing,
            is_me: isMe,
            has_premium: user.has_premium,
            verified: user.verified,
            ...getProfileResponse(profile),
        },
    };
}

// This is for returning the post result from endpoints which return a list of posts
// For performance reasons and less work for the server, we don't return the user's profile
// as it's unlikely that the user will click on every single post

/**
 * @param post Post to return
 * @param user User who requested the post
 * @returns Post result response
 */
export function getPostResultResponse(post: Post, user: User) {
    return {
        uuid: post.uuid,
        title: post.title,
        description: post.description,
        liked: post.liked,
        bookmarked: post.bookmarked,
        display_location: {
            lat: post.approx_lat,
            lon: post.approx_lon,
            location_name: post.location_name,
        },
        // If the user is the owner of the post, send the true location
        true_location: {
            lat: user.id == post.user_id ? post.lat : null,
            lon: user.id == post.user_id ? post.lon : null,
        },
        job_type: post.job_type,
        is_remote: post.remote,
        price: post.price,
        start_date: post.start_date,
        end_date: post.end_date,
        reserved: !!post.reserved_by,
        tags: post.tags.map((tag) => tag.tag_id),
        media: post.media.map((media) => ({
            media: media.media,
            media_type: media.media_type,
        })),
        is_urgent: post.urgent,
        status: post.status,
        created_at: post.created_at,
        updated_at: post.updated_at,
        analytics: {
            likes: post.likes,
            impressions: post.impressions,
            shares: post.shares,
            bookmarks: post.bookmarks,
            comments: post.comments,
        },
        user: {
            uuid: post.user_uuid,
            username: post.username,
            first_name: post.first_name,
            last_name: post.last_name,
            is_following: post.following,
            is_me: user.id == post.user_id,
            has_premium: post.has_premium,
            verified: post.verified,
            profile: {
                profile_picture: post.profile_picture,
            },
        },
    };
}
