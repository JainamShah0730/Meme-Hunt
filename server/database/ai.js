import OpenAI from "openai"
import { HfInference } from '@huggingface/inference'
import 'dotenv/config'

export const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
})

export const hf = new HfInference(process.env.HF_TOKEN)

export async function embed(text, retries = 3, delayMs = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: text,
            });
            return Array.from(result);
        } catch (err) {
            const is500 = err?.httpResponse?.status === 500;
            if (is500 && i < retries - 1) {
                console.log(`HF model error, retrying in ${delayMs}ms... (attempt ${i + 1}/${retries})`);
                await new Promise(res => setTimeout(res, delayMs));
            } else {
                throw err;
            }
        }
    }
}