import * as connection from "../src/database/connection";
import Post from "../src/database/wrappers/posts/post";
import {
    PostReads,
    PostWrites,
} from "../src/database/wrappers/posts/post/wrapper";
import { JobType, PostStatus } from "../src/database/models/posts/post";

const USER_ID = 45;

describe("Post database queries", () => {
    it("connects to the database", async () => {
        expect(await connection.connect()).toBeTruthy();
    });

    let post: Post;

    it("adds a post to the database", async () => {
        post = (await PostWrites.createPost({
            title: "Test Post",
            description: "This is a test post",
            user_id: USER_ID, // This must be a valid user ID
            title_vector: "[1, 2, 3]",
            classified_category: 1,
            tags: [1],
            media: [
                {
                    media_type: "image",
                    media: "https://picsum.photos/200",
                },
            ],
            status: PostStatus.OPEN,
            location: {
                location_name: "Test City",
                lat: 0,
                lon: 0,
                approx_lat: 0,
                approx_lon: 0,
                remote: false,
                suggestion_radius: 5,
            },
            price: 5,
            start_date: new Date(),
            end_date: new Date(),
            urgent: false,
            job_type: JobType.FULL_TIME,
        })) as Post;

        expect(post).toBeTruthy();
    });

    it("gets a post by ID", async () => {
        const postById = await PostReads.getPostById(post.id);

        expect(postById).toBeTruthy();

        expect(postById?.id).toBe(post.id);

        expect(postById?.title).toBe(post.title);
    });

    it("gets a post by UUID", async () => {
        const postByUUID = await PostReads.getPostByUUID(post.uuid);
        expect(postByUUID).toBeTruthy();
        expect(postByUUID?.uuid).toBe(post.uuid);
    });

    // Post class methods

    it("gets the author of a post", async () => {
        const author = await post.getUser();

        expect(author).toBeTruthy();
        expect(parseInt(author?.id as any)).toEqual(
            parseInt(post.user_id as any)
        );
    });

    it("updates a post", async () => {
        const updated = await post.updatePostData({
            title: "Updated Post",
            description: "This is an updated post",
        });

        expect(updated).toBeTruthy();
    });

    it("deletes a post", async () => {
        const deleted = await post.deletePost();

        expect(deleted).toBeTruthy();
    });

    it("disconnects from the database", async () => {
        connection.disconnect();
    });
});
