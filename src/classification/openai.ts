import OpenAI from "openai";
import { openAiKey } from "../config";

// Create an instance of the OpenAI API client
const openai = new OpenAI({
    apiKey: openAiKey,
});

export default openai;
