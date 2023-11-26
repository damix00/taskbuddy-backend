import { executeQuery } from "../../../../connection";
import {
    CategoryWithTags,
    PostCategoryModel,
} from "../../../../models/posts/post_category";

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

            return result;
        } catch (err) {
            console.log(err);

            return null;
        }
    }
}

export default reads;
