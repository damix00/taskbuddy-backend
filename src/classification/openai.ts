import OpenAI from "openai";
import { openAiKey } from "../config";

const openai = new OpenAI({
    apiKey: openAiKey,
});

export default openai;
