import Category from ".";
import { PostCategoryModel } from "../../../models/posts/post_category";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toCategory(
    category: PostCategoryModel | Category | null
): Category | null {
    if (!category) return null;

    return new Category(category);
}

export class CategoryReads {
    static async getCategoryById(id: number): Promise<Category | null> {
        const category = await reads.getCategoryById(id);
        return toCategory(category);
    }
}

export class CategoryWrites {
    static async createCategory(
        translations: [string, string][]
    ): Promise<boolean> {
        return await writes.createCategory(translations);
    }

    static async updateCategory(
        id: number,
        translations: { [key: string]: string }
    ): Promise<boolean> {
        return await writes.updateCategory(id, translations);
    }

    static async deleteCategory(id: number): Promise<boolean> {
        return await writes.deleteCategory(id);
    }
}
