import Category from "../database/wrappers/posts/categories";
import { CategoryReads } from "../database/wrappers/posts/categories/wrapper";

export let categories: Category[] = [];

async function fetchCategories() {
    const res = await CategoryReads.getAllCategories();

    if (res) {
        categories = res;
    }
}

export async function init() {
    await fetchCategories();
    setInterval(fetchCategories, 30 * 1000);
}
