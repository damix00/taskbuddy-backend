import { PostTagFields } from "./post_tag";

export interface PostCategoryFields {
    category_id: number;
    translations: { [key: string]: string };
    created_at: Date;
    updated_at: Date;
}

export interface CategoryWithTags {
    category_id: number;
    translations: { [key: string]: string };
    tags: PostTagFields[];
    created_at: Date;
    updated_at: Date;
}

export interface PostCategoryModel extends PostCategoryFields {
    update(data: Partial<PostCategoryFields>): Promise<boolean>;
    deleteCategory(): Promise<boolean>;
    refetch(): Promise<void>;
    addTranslation(language: string, translation: string): Promise<boolean>;
    removeTranslation(language: string): Promise<boolean>;
    getTranslation(language: string): string | null;
    getTranslations(): { [key: string]: string };
}
