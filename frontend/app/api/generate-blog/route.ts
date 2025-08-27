import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GoogleGenAI, Modality } from '@google/genai';
import { compressMultipleImages, dataUrlToBuffer, bufferToDataUrl, compressImageToWebP, estimateBlogSize } from '@/lib/imageCompression';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const genAIv2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Helper: generate images via Gemini with fallback models
async function generateImagesViaGemini(
  topic: string
): Promise<Array<{ url: string; alt: string; source?: string }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set; skipping image generation");
    return [];
  }

  // Try multiple models for better reliability - using only available models
  const imageModels = [
    "gemini-2.0-flash-preview-image-generation",
    "gemini-2.5-flash-preview-image-generation"
  ];

  const prompt = `Create a professional, elegant header image for a blog post about "${topic}". 
    The image should reflect the luxury hair extension brand Emilio Beaufort, 
    with sophisticated styling, professional composition, and high-end aesthetic. 
    Make it suitable for B2B audience with clean, modern design.`;

  for (const modelName of imageModels) {
    try {
      console.log(`Attempting image generation with: ${modelName}`);
      const startTime = Date.now();
      
      // Add timeout for image generation to prevent hanging
      const imageGenerationPromise = genAIv2.models.generateContent({
        model: modelName,
        contents: [{ text: prompt }],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      // Race against timeout
      const response = await Promise.race([
        imageGenerationPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Image generation timeout')), 15000)
        )
      ]) as any;

      const images: Array<{ url: string; alt: string; source?: string }> = [];
      
      // Extract images from the response with proper null checks
      if (response?.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            
            images.push({
              url: `data:${mimeType};base64,${imageData}`,
              alt: `Header image for blog topic: ${topic}`,
              source: modelName,
            });
            
            // Limit to 3 images
            if (images.length >= 3) break;
          }
        }
      }

      if (images.length > 0) {
        const elapsed = Date.now() - startTime;
        console.log(`${modelName} image generation successful: ${images.length} images created in ${elapsed}ms`);
        return images;
      }

      console.warn(`${modelName}: No images generated from response`);
      
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown error';
      console.warn(`${modelName} image generation failed: ${errorMsg}`);
      
      // If it's a 404 or model not found error, skip to next model immediately
      if (errorMsg.includes('404') || errorMsg.includes('NOT_FOUND') || errorMsg.includes('not found')) {
        console.log(`${modelName} not available, trying next model...`);
        continue;
      }
      
      // For other errors, still try the next model
      continue;
    }
  }

  console.warn("All image generation models failed");
  return [];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { topic, tone, length, keywords, targetAudience, includeImages } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    console.log(`Starting blog generation for topic: "${topic}"`);
    
    // Start image generation immediately in parallel with timeout
    const imageGenerationPromise = includeImages ? 
      Promise.race([
        generateImagesViaGemini(topic),
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('Image generation timeout')), 10000)
        )
      ]).catch(err => {
        console.warn('Image generation failed or timed out:', err);
        return [];
      }) : Promise.resolve([]);

    // Use JSON mode to ensure strict JSON output
    const generationConfig: any = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT as typeof SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING as typeof SchemaType.STRING },
          content: { type: SchemaType.STRING as typeof SchemaType.STRING },
          keywords: { type: SchemaType.ARRAY as typeof SchemaType.ARRAY, items: { type: SchemaType.STRING as typeof SchemaType.STRING } },
          tags: { type: SchemaType.ARRAY as typeof SchemaType.ARRAY, items: { type: SchemaType.STRING as typeof SchemaType.STRING } },
          summary: { type: SchemaType.STRING as typeof SchemaType.STRING }
        },
        required: ['title', 'content']
      }
    };

    const prompt = `
You are a professional hair extension content writer for Emilio Beaufort, a luxury hair extensions company. 
Generate a high-quality blog post based on the following requirements:

Topic: ${topic}
Tone: ${tone}
Length: ${length === 'short' ? '300-500 words' : length === 'medium' ? '800-1200 words' : '1500-2000 words'}
${keywords && keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Please provide the response in the following JSON format:
{
  "title": "Engaging blog post title",
  "content": "Full blog post content in HTML format with proper formatting (headings, paragraphs, lists, etc.)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "Brief 2-3 sentence summary of the blog post"
}
`;

    // Helper function to extract text from Gemini response with better error handling
    const getResponseText = (resp: any): string => {
      try {
        const t = (resp.text?.() || '').trim();
        if (t) return t;
      } catch (err) {
        console.warn('Failed to get response text via text() method:', err);
      }
      try {
        const cands = resp.candidates || [];
        for (const c of cands) {
          const parts = (c.content?.parts || []);
          for (const p of parts) {
            const pt = (p.text || '').trim();
            if (pt) return pt;
          }
        }
      } catch (err) {
        console.warn('Failed to extract text from candidates:', err);
      }
      return '';
    };

    // Optimized retry function with shorter delays for better performance
    const retryWithBackoff = async (fn: () => Promise<any>, maxRetries: number = 2): Promise<any> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error: any) {
          const isRetryable = error?.message?.includes('500') || 
                             error?.message?.includes('Internal Server Error') ||
                             error?.message?.includes('quota') ||
                             error?.status === 500 ||
                             error?.status === 429;
          
          if (attempt === maxRetries || !isRetryable) {
            throw error;
          }
          
          // Reduced delay for faster retries: 500ms, 1s max
          const delay = Math.min(500 * attempt, 1000);
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    // Enhanced JSON parsing with better error handling for large responses
    const parseJsonResponse = (text: string): any => {
      if (!text) throw new Error('Empty response text');
      
      // Truncate extremely large responses that might cause parsing issues
      const maxLength = 500000; // 500KB limit
      let processText = text.length > maxLength ? text.substring(0, maxLength) : text;
      
      // Strategy 1: Direct JSON parse
      try {
        return JSON.parse(processText);
      } catch (err) {
        console.warn('Direct JSON parse failed:', err);
      }
      
      // Strategy 2: Extract JSON from markdown code blocks
      const codeBlockMatch = processText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
      if (codeBlockMatch) {
        try {
          return JSON.parse(codeBlockMatch[1]);
        } catch (err) {
          console.warn('Code block JSON parse failed:', err);
        }
      }
      
      // Strategy 3: Find JSON object boundaries with better handling
      const jsonStart = processText.indexOf('{');
      let jsonEnd = -1;
      
      // Find the matching closing brace by counting braces
      if (jsonStart !== -1) {
        let braceCount = 0;
        let inString = false;
        let escaped = false;
        
        for (let i = jsonStart; i < processText.length; i++) {
          const char = processText[i];
          
          if (escaped) {
            escaped = false;
            continue;
          }
          
          if (char === '\\') {
            escaped = true;
            continue;
          }
          
          if (char === '"' && !escaped) {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                jsonEnd = i;
                break;
              }
            }
          }
        }
        
        if (jsonEnd !== -1) {
          try {
            const candidate = processText.slice(jsonStart, jsonEnd + 1);
            return JSON.parse(candidate);
          } catch (err) {
            console.warn('Balanced brace extraction failed:', err);
          }
        }
      }
      
      // Strategy 4: Try to fix common JSON issues with better cleaning
      try {
        let cleaned = processText
          .replace(/^[^{]*/, '') // Remove text before first {
          .replace(/[^}]*$/, '') // Remove text after last }
          .replace(/\\n/g, '\\\\n') // Escape newlines in strings
          .replace(/\\t/g, '\\\\t') // Escape tabs in strings
          .replace(/\\r/g, '\\\\r') // Escape carriage returns
          .trim();
        
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn('Cleaned JSON parse failed:', err);
      }
      
      throw new Error('Failed to parse JSON from response');
    };

    // Use updated model fallback sequence
    const modelOrder = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let parsedContent: any = null;
    let lastErr: any = null;

    // Optimized model attempts with faster fallback strategy
    for (const modelName of modelOrder) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        
        // Ultra-aggressive timeout for immediate fallback
        const attemptWithTimeout = async (timeoutMs: number = 3000) => {
          const startTime = Date.now();
          console.log(`Starting ${modelName} attempt with ${timeoutMs}ms timeout`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log(`${modelName} timed out after ${timeoutMs}ms`);
            controller.abort();
          }, timeoutMs);
          
          try {
            const mdl = genAI.getGenerativeModel({ model: modelName, generationConfig });
            const result = await mdl.generateContent(prompt);
            const resp = await result.response;
            clearTimeout(timeoutId);
            const elapsed = Date.now() - startTime;
            console.log(`${modelName} completed in ${elapsed}ms`);
            return getResponseText(resp).trim();
          } catch (error: any) {
            clearTimeout(timeoutId);
            const elapsed = Date.now() - startTime;
            console.log(`${modelName} failed after ${elapsed}ms:`, error.message);
            throw error;
          }
        };
        
        let trimmed = await attemptWithTimeout(); // No retries for faster fallback

        // If empty, try simplified JSON mode with timeout
        if (!trimmed) {
          console.log(`${modelName}: Primary attempt empty, trying simplified mode`);
          const simplifiedAttempt = async () => {
            const startTime = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log(`${modelName} simplified mode timed out`);
              controller.abort();
            }, 2000); // Ultra-short timeout for simplified attempt
            
            try {
              const mdl = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: 'application/json' }
              });
              const result = await mdl.generateContent(prompt);
              const resp = await result.response;
              clearTimeout(timeoutId);
              const elapsed = Date.now() - startTime;
              console.log(`${modelName} simplified completed in ${elapsed}ms`);
              return getResponseText(resp).trim();
            } catch (error: any) {
              clearTimeout(timeoutId);
              const elapsed = Date.now() - startTime;
              console.log(`${modelName} simplified failed after ${elapsed}ms:`, error.message);
              throw error;
            }
          };
          
          try {
            trimmed = await simplifiedAttempt();
          } catch (err) {
            console.log(`${modelName}: Simplified attempt failed, moving to next model`);
          }
        }

        if (!trimmed) {
          throw new Error('Empty response');
        }

        // Use enhanced JSON parsing
        parsedContent = parseJsonResponse(trimmed);
        
        // Validate required fields
        if (!parsedContent.title || !parsedContent.content) {
          throw new Error('Missing required fields in parsed content');
        }

        console.log(`Successfully used model: ${modelName}`);
        break;
        
      } catch (err: any) {
        lastErr = err;
        const errorMsg = err?.message || 'Unknown error';
        console.warn(`Model failed: ${modelName} - ${errorMsg}`);
        continue;
      }
    }

    if (!parsedContent) {
      console.error('All models failed or quota exceeded:', lastErr);
      return NextResponse.json({ error: 'request failed , all models quota exceeded' }, { status: 429 });
    }

    // Wait for image generation to complete (started earlier)
    const rawImages = await imageGenerationPromise;
    let images: Array<{ url: string; alt: string; source?: string }> = [];
    
    if (rawImages.length > 0) {
      try {
        console.log(`Compressing ${rawImages.length} images to WebP format...`);
        const imageUrls = rawImages.map(img => img.url);
        // Use optimized batch compression with smaller batch size for faster processing
        const compressedUrls = await compressMultipleImages(imageUrls, 1024 * 1024, 2); // 2 images at a time
        
        images = rawImages.map((img, index) => ({
          ...img,
          url: compressedUrls[index] || img.url, // Fallback to original if compression fails
          source: img.source + ' (compressed to WebP)'
        }));
        
        console.log(`Successfully compressed ${images.length} images`);
      } catch (error) {
        console.error('Image compression failed, using original images:', error);
        images = rawImages;
      }
    }

    // Append images into HTML content
    if (images.length > 0 && typeof parsedContent.content === 'string') {
      const galleryHtml = `<div class="ai-generated-images" style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;">${images
        .map((img) => `<img src="${img.url}" alt="${img.alt}" style="width:100%;height:auto;border-radius:8px;object-fit:cover;" />`)
        .join('')}</div>`;
      parsedContent.content += galleryHtml;
    }

    // Estimate total blog size and validate it's under Firebase limit
    const totalBlogSize = estimateBlogSize(parsedContent.content, images.map(img => img.url));
    const maxFirebaseSize = 1024 * 1024; // 1MB Firebase document limit
    
    console.log(`Total blog size: ${(totalBlogSize / 1024).toFixed(2)} KB`);
    
    // If still too large, compress images further
    if (totalBlogSize > maxFirebaseSize && images.length > 0) {
      console.log('Blog exceeds 1MB, applying additional compression...');
      try {
        const smallerLimit = Math.floor((maxFirebaseSize * 0.6) / images.length); // Use 60% of limit for images
        const recompressedUrls = await compressMultipleImages(images.map(img => img.url), smallerLimit);
        
        images = images.map((img, index) => ({
          ...img,
          url: recompressedUrls[index] || img.url,
          source: img.source + ' (extra compressed)'
        }));
        
        const newSize = estimateBlogSize(parsedContent.content, images.map(img => img.url));
        console.log(`Recompressed blog size: ${(newSize / 1024).toFixed(2)} KB`);
      } catch (error) {
        console.error('Additional compression failed:', error);
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.log(`Blog generation completed in ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    
    return NextResponse.json({
      title: parsedContent.title,
      content: parsedContent.content,
      keywords: parsedContent.keywords || [],
      tags: parsedContent.tags || [],
      summary: parsedContent.summary,
      images,
      metadata: {
        estimatedSize: totalBlogSize,
        compressionApplied: images.some(img => img.source?.includes('compressed')),
        imageCount: images.length,
        generationTimeMs: totalTime
      }
    });

  } catch (error) {
    console.error('Error generating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post' },
      { status: 500 }
    );
  }
}
