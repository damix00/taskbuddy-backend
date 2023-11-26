export interface PostCategoryFields {
    id: number;
    translations: [string, string][];
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
