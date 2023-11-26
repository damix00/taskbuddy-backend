export interface PostTagFields {
    id: number;
    category_id: number;
    translations: [string, string][];
    created_at: Date;
    updated_at: Date;
}

export interface PostTagModel extends PostTagFields {
    update(data: Partial<PostTagFields>): Promise<boolean>;
    deleteTag(): Promise<boolean>;
    refetch(): Promise<void>;
    addTranslation(language: string, translation: string): Promise<boolean>;
    removeTranslation(language: string): Promise<boolean>;
    getTranslation(language: string): string | null;
    getTranslations(): { [key: string]: string };
}
