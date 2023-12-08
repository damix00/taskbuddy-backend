import Tag from ".";
import { executeQuery } from "../../../connection";
import { PostTagModel } from "../../../models/posts/post_tag";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toTag(tag: PostTagModel | Tag | null): Tag | null {
    if (!tag) return null;

    tag.tag_id = parseInt(tag.tag_id as unknown as string); // Cast to number because it's a bigint in the database

    return new Tag(tag);
}

export class TagReads {
    static async getTagById(id: number): Promise<Tag | null> {
        return toTag(await reads.getTagById(id));
    }
}

export class TagWrites {
    // Function to create a new tag
    public static async createTag(
        category_id: number,
        translations: { [key: string]: string }
    ): Promise<Tag | null> {
        return toTag(await writes.createTag(category_id, translations));
    }

    // Function to update a tag
    public static async updateTag(
        id: number,
        category_id: number,
        translations: { [key: string]: string }
    ): Promise<boolean> {
        return await writes.updateTag(id, category_id, translations);
    }

    public static async deleteTag(id: number): Promise<boolean> {
        return await writes.deleteTag(id);
    }
}
