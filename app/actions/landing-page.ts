"use server";

import { adCopyOutputSchema, adCopySystemPrompt, adCopyUserPrompt, generateCopy } from "@/lib/ai/product-landing-page/copy";
import { fileToBase64 } from "@/lib/utils";
import type { ArabicDialect, CopyLanguage, ImageData } from "@/types/landing-page";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateFeatures } from "@/lib/ai/product-landing-page/features";



export async function generateLandingPage(
  productImages: File[],
  language: CopyLanguage,
  dialect: ArabicDialect,
  productName: string,
  price: string
) {

 

  const copy = await generateCopy(language, dialect, price, productName, productImages);
  const features = await generateFeatures(language, dialect, productImages);
  console.log(copy);
  console.log(features);
  // TODO: Use `copy` together with `images`, `language`, `dialect`, and `price` to build and return the full landing page state.
}