"use server";

import { adCopyOutputSchema, adCopySystemPrompt, adCopyUserPrompt, generateAdCopy } from "@/lib/ai/ad-copy";
import { fileToBase64 } from "@/lib/utils";
import type { ArabicDialect, CopyLanguage, ImageData } from "@/types/landing-page";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google";
import { ChatPromptTemplate } from "@langchain/core/prompts";



export async function generateLandingPage(
  productImages: File[],
  language: CopyLanguage,
  dialect: ArabicDialect,
  productName: string,
  price: string
) {

 

  const copy = await generateAdCopy(language, dialect, price, productName, productImages);

  console.log(copy);

  // TODO: Use `copy` together with `images`, `language`, `dialect`, and `price` to build and return the full landing page state.
}