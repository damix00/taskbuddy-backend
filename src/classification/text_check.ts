import openai from "./openai";

export async function checkText(text: string): Promise<boolean> {
    try {
        const result = await openai.moderations.create({
            input: text,
        });

        if (result.results.length === 0) {
            // OpenAI error, should never happen
            return false; // We don't know if it's safe or not, so we'll assume it is
        }

        const categories = result.results[0].categories;

        return (
            categories["harassment/threatening"] ||
            categories["self-harm"] ||
            categories["self-harm/instructions"] ||
            categories["self-harm/intent"] ||
            categories.sexual ||
            categories["sexual/minors"]
        );
    } catch (e) {
        console.error(e);
        return false;
    }
}
