import { ChatGoogle } from "@langchain/google";


export const textModel = new ChatGoogle("gemini-2.5-flash");

export const imageModel = new ChatGoogle(
    "gemini-3-pro-image-preview",
    {
        responseModalities: ["IMAGE", "TEXT"],
    }
);