import { executeQuery } from "../../../../connection";
import {
    CategoryWithTags,
    PostCategoryModel,
} from "../../../../models/posts/post_category";
import { PostTagModel } from "../../../../models/posts/post_tag";

namespace reads {
    export async function getCategoryById(
        id: number
    ): Promise<PostCategoryModel | null> {
        try {
            const query = `
                SELECT *
                FROM post_categories
                WHERE category_id = $1
            `;

            const result = await executeQuery<PostCategoryModel>(query, [id]);

            return result.length > 0 ? result[0] : null;
        } catch (err) {
            return null;
        }
    }

    export async function fetchAllTagsByCategory(
        category_id: number
    ): Promise<PostTagModel[] | null> {
        try {
            const query = `
                SELECT *
                FROM post_tags
                INNER JOIN post_categories ON post_tags.category_id = post_categories.category_id
                WHERE post_categories.category_id = $1
            `;

            const result = await executeQuery<PostTagModel>(query, [
                category_id,
            ]);

            return result;
        } catch (err) {
            console.log(err);

            return null;
        }
    }

    export async function fetchWithTags(): Promise<CategoryWithTags[] | null> {
        try {
            // The return value should look like this:
            // [
            //     {
            //         category_id: 1,
            //         translations: {
            //             en: "English Translation",
            //             hr: "Hrvatski Prijevod",
            //         },
            //         tags: [
            //             {
            //                 tag_id: 1,
            //                 translations: {
            //                     en: "English Translation",
            //                     hr: "Hrvatski Prijevod",
            //                 },
            //                 ...
            //             },
            //             ...
            //         ],
            //     },
            //     ...
            // ]

            const query = `
            SELECT
                pc.category_id, 
                pc.translations, 
                COALESCE(json_agg(pt) FILTER (WHERE pt.tag_id IS NOT NULL), '[]') as tags
            FROM
                post_categories pc
            LEFT JOIN
                post_tags pt ON pc.category_id = pt.category_id
            GROUP BY
                pc.category_id;
            `;

            const result = await executeQuery<CategoryWithTags>(query);

            let resp: CategoryWithTags[] = result
                .map((category) => {
                    // Map the result to the desired format
                    return {
                        category_id: parseInt(
                            category.category_id as unknown as string
                        ),
                        translations: category.translations,
                        tags: category.tags,
                        created_at: category.created_at,
                        updated_at: category.updated_at,
                    };
                })
                .sort((a, b) => a.category_id - b.category_id); // Sort by category_id

            return resp;
        } catch (err) {
            console.log(err);

            return null;
        }
    }
}

export default reads;
