import { DataModel } from "../../../data_model";
import { PostTagFields, PostTagModel } from "../../../models/posts/post_tag";
import reads from "./queries/reads";
import writes from "./queries/writes";

class Tag extends DataModel implements PostTagModel {
    tag_id: number;
    category_id: number;
    translations: { [key: string]: string };
    created_at: Date;
    updated_at: Date;

    constructor(
        tag: PostTagFields | PostTagModel | Tag,
        refetchOnUpdate: boolean = true
    ) {
        super(refetchOnUpdate);

        Object.assign(this, tag);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const result = await reads.getTagById(this.tag_id);

        if (!result) throw new Error("Tag not found");

        super.setData(result);
    }

    // Updates a tag
    public async update(data: Partial<PostTagFields>): Promise<boolean> {
        this._refetch();

        const newTag = { ...this, ...data };

        const r = await writes.updateTag(
            this.tag_id,
            newTag.category_id,
            newTag.translations
        );

        if (r) {
            super.setData(newTag);
        }

        return r;
    }

    // Deletes a tag
    public async deleteTag(): Promise<boolean> {
        return await writes.deleteTag(this.tag_id);
    }

    // Adds a translation to a tag
    // Translations are in the format of { language: translation }
    public async addTranslation(
        language: string,
        translation: string
    ): Promise<boolean> {
        let translations: { [key: string]: string } = {
            ...this.translations,
        };
        translations[language] = translation;

        return await this.update({ translations: translations });
    }

    public async removeTranslation(language: string): Promise<boolean> {
        let translations: { [key: string]: string } = {
            ...this.translations,
        };

        if (!translations[language]) return false;

        delete translations[language];

        return await this.update({ translations: translations });
    }

    public getTranslation(language: string): string | null {
        return this.translations[language] || null;
    }

    public getTranslations(): { [key: string]: string } {
        return this.translations;
    }
}

export default Tag;
