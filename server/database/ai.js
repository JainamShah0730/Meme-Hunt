import OpenAI from "openai"
import { HfInference } from '@huggingface/inference'
import 'dotenv/config'

export const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
})

export const hf = new HfInference(process.env.HF_TOKEN)

export async function embed(text) {
    const result = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
    })
    return Array.from(result)

}