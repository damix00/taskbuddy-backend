import Category from ".";
import {
    CategoryWithTags,
    CategoryWithTagsModel,
    PostCategoryModel,
} from "../../../models/posts/post_category";
import Tag from "../tags";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toCategory(
    category: PostCategoryModel | Category | null
): Category | null {
    if (!category) return null;

    category.category_id = parseInt(category.category_id as unknown as string); // Cast to number because it's a bigint in the database

    return new Category(category);
}

export class CategoryReads {
    static async getCategoryById(id: number): Promise<Category | null> {
        const category = await reads.getCategoryById(id);
        return toCategory(category);
    }

    static async fetchWithTags(): Promise<CategoryWithTagsModel[] | null> {
        const resp = await reads.fetchWithTags();

        if (!resp) return null;

        return resp.map((item) => {
            return {
                category: new Category({
                    category_id: item.category_id,
                    translations: item.translations,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                }),
                tags: item.tags.map((tag) => {
                    return new Tag(tag);
                }),
            };
        });
    }

    static async getAllCategories(): Promise<Category[] | null> {
        const categories = await reads.getAllCategories();

        if (!categories) return null;

        return categories.map((category) => {
            return new Category(category);
        });
    }
}

export class CategoryWrites {
    static async createCategory(translations: {
        [key: string]: string;
    }): Promise<Category | null> {
        return toCategory(await writes.createCategory(translations));
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
