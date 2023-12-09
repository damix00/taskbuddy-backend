import { CohereClient } from "cohere-ai";
import { cohereToken } from "../config";

const cohere = new CohereClient({
    token: cohereToken,
});

// Generate embeddings for a given text
// Enables us to compare the similarity between two texts
// isSearching is true if the text is a search query
export async function generateEmbedding(
    text: string,
    isSearching: boolean = false
) {
    const response = await cohere.embed({
        texts: [text],
        model: "embed-multilingual-v3.0",
        inputType: isSearching ? "search_query" : "search_document",
    });
    return response.embeddings[0];
}
