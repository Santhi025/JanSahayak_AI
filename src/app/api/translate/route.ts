import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithRetry } from '@/lib/gemini-utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { text, texts, targetLang } = await req.json();

    if (!targetLang) {
      return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });
    }

    if (texts && Array.isArray(texts)) {
      const prompt = `Translate the following list of UI strings into the language code: ${targetLang}. 
      Return the output strictly as a JSON object where the keys are the original English strings and the values are the translations.
      Return ONLY the raw JSON string. Do not wrap it in markdown code block or backticks.

      Strings to translate:
      ${JSON.stringify(texts, null, 2)}`;

      let response = await generateContentWithRetry(prompt, {
        model: "gemini-2.5-flash-lite", // Using flash-lite for speed
      });

      response = response.trim();
      const cleanJson = response.replace(/```json/gi, '').replace(/```/g, '').trim();
      const translations = JSON.parse(cleanJson);
      return NextResponse.json({ translations });
    }

    if (!text) {
      return NextResponse.json({ error: 'Text or texts is required' }, { status: 400 });
    }

    const prompt = `Translate the following UI text into the language code: ${targetLang}. 
    Return ONLY the translated string, with no additional formatting, quotes, or markdown.
    
    Text to translate:
    ${text}`;

    let translatedText = await generateContentWithRetry(prompt, {
      model: "gemini-2.5-flash-lite", // Using lite for faster translations
    });
    
    translatedText = translatedText.trim();
    // Clean up any potential markdown or quotes
    translatedText = translatedText.replace(/^["'](.*)["']$/, '$1');

    return NextResponse.json({ translatedText });
    
  } catch (error) {
    console.error('Error in translate API:', error);
    return NextResponse.json(
      { error: 'Failed to translate' }, 
      { status: 500 }
    );
  }
}
