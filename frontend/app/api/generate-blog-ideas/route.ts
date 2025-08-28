import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { category } = body;
    
    console.log(`Starting blog ideas generation${category ? ` for category: "${category}"` : ''}`);

    // Use Gemini 2.5 Pro as default with proper fallbacks
    const modelOrder = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: { 
        type: SchemaType.ARRAY as typeof SchemaType.ARRAY, 
        items: { type: SchemaType.STRING as typeof SchemaType.STRING } 
      }
    };

                                       const prompt = `
Generate 10 engaging blog post ideas for Emilio Beaufort, a luxury hair extensions company.
${category ? `Focus on the category: ${category}` : 'Cover various hair extension topics'}

Topics should include:
- Hair extension care and maintenance
- Different types of hair extensions (clip-ins, tape-ins, sew-ins, fusion, etc.)
- How to choose the right hair extensions for different hair types
- Hair extension installation and styling tips
- Starting a hair extension business
- Hair extension industry insights and trends
- Customer success stories and testimonials
- Professional hair extension advice
- Hair extension troubleshooting and solutions
- Luxury hair extension experiences
- Hair extension brands and products
- Hair extension techniques and methods
- Hair extension pricing and business models
- Hair extension marketing and client acquisition

Return only the titles as a JSON array:
["Title 1", "Title 2", "Title 3", ...]

Make sure the titles are:
- Engaging and click-worthy
- Relevant to hair extension audience
- Specific and actionable
- SEO-friendly
- Brand-appropriate for Emilio Beaufort's hair extension business
- Cover a broad range of hair extension topics and brands
`;

    // Helpers
    const sanitizeIdeas = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      const strings = (value as unknown[])
        .map(v => (typeof v === 'string' ? v : typeof v === 'object' && v && 'title' in (v as any) ? String((v as any).title) : ''))
        .map(v => v.trim())
        .filter(v => v.length > 0);
      return Array.from(new Set(strings));
    };

    const buildFallbackIdeas = (cat?: string): string[] => {
      const focus = cat ? `for ${cat}` : '';
      return [
        `Ultimate Care Guide ${focus} Hair Extensions`,
        `Top 10 Styling Tips to Make Extensions Look Seamless`,
        `Choosing the Right Length and Volume For Your Hair`,
        `Clip-ins vs Tape-ins vs Sew-ins: What Suits You Best?`,
        `How to Wash and Maintain Luxury Hair Extensions`,
        `Color Matching 101: Extensions That Blend Perfectly`,
        `Starter Kit: Launching a Boutique Hair Extension Business`,
        `Salon-Pro Secrets: Long-Lasting Installations`,
        `Red Flags: Common Extension Mistakes and Fixes`,
        `Trend Report: What’s New in Premium Hair Extensions`,
      ];
    };

    // Optimized idea generation with faster models and timeouts
    const tryGenerateIdeas = async (): Promise<string[] | null> => {
      for (const modelName of modelOrder) {
        try {
          console.log(`Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
          
          // Optimized attempt with faster timeout for better fallback
          const attemptWithTimeout = async (timeoutMs: number = 6000) => {
            const startTime = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log(`${modelName} timed out after ${timeoutMs}ms`);
              controller.abort();
            }, timeoutMs);
            
            try {
              const result = await model.generateContent(prompt);
              const response = await result.response;
              clearTimeout(timeoutId);
              const elapsed = Date.now() - startTime;
              console.log(`${modelName} completed in ${elapsed}ms`);
              return response.text();
            } catch (error: any) {
              clearTimeout(timeoutId);
              const elapsed = Date.now() - startTime;
              console.log(`${modelName} failed after ${elapsed}ms:`, error.message);
              throw error;
            }
          };
          
          const raw = await attemptWithTimeout();
          const trimmed = (raw ?? '').toString().trim();
          
          if (!trimmed) {
            console.warn(`${modelName}: Empty response`);
            continue;
          }
          
          // Enhanced JSON parsing with better error handling
          let parsed: unknown;
          try {
            parsed = JSON.parse(trimmed);
          } catch (parseError) {
            console.warn(`${modelName}: Direct JSON parse failed, trying extraction`);
            try {
              // Try to extract JSON array from response
              const start = trimmed.indexOf('[');
              const end = trimmed.lastIndexOf(']');
              if (start !== -1 && end !== -1 && end > start) {
                const candidate = trimmed.slice(start, end + 1);
                parsed = JSON.parse(candidate);
              } else {
                // Try to extract from code blocks
                const codeBlockMatch = trimmed.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
                if (codeBlockMatch) {
                  parsed = JSON.parse(codeBlockMatch[1]);
                } else {
                  console.warn(`${modelName}: Failed to parse JSON`);
                  continue;
                }
              }
            } catch (extractError) {
              console.warn(`${modelName}: JSON extraction failed:`, extractError);
              continue;
            }
          }
          
          const ideas = sanitizeIdeas(parsed);
          if (ideas.length > 0) {
            console.log(`Successfully generated ${ideas.length} ideas using ${modelName}`);
            return ideas;
          }
        } catch (err: any) {
          const errorMsg = err?.message || 'Unknown error';
          console.warn(`${modelName} failed: ${errorMsg}`);
          
          // Skip to next model for faster fallback
          continue;
        }
      }
      return null;
    };

    const ideas = await tryGenerateIdeas();
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Blog ideas generation completed in ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    
    if (ideas && ideas.length > 0) {
      return NextResponse.json({ 
        ideas,
        metadata: {
          generationTimeMs: totalTime,
          fallback: false
        }
      });
    }

    // Fallback to avoid 500s
    console.log('Using fallback ideas due to API failures');
    return NextResponse.json({ 
      ideas: buildFallbackIdeas(category), 
      metadata: {
        generationTimeMs: totalTime,
        fallback: true
      }
    });

  } catch (error) {
    console.error('Error generating blog ideas (outer catch):', error);
    return NextResponse.json({ 
      error: 'Please try again later. Blog ideas generation service is temporarily unavailable.',
      ideas: [
        'Luxury Hair Extensions: The Complete Care Handbook',
        'Perfect Blend: Color Matching Extensions Made Easy',
        'Top 7 Secrets for Seamless, Natural-Looking Extensions',
        'How to Choose the Right Extension Method for You',
        'From Day to Night: Chic Hairstyles with Extensions',
      ], 
      fallback: true 
    });
  }
}
