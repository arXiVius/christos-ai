import { GoogleGenAI, Type } from '@google/genai';
import type { Page } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface GeminiResponse {
  thought: string;
  pages: Page[];
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    thought: {
      type: Type.STRING,
      description:
        "A detailed, step-by-step explanation of your thinking process in markdown format. Describe how you interpreted the user's request, the design choices (color, typography, layout) you're making, why they fit the requested style, and your plan for generating or modifying the files. Be insightful and clear.",
    },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          filename: {
            type: Type.STRING,
            description:
              'The filename, e.g., "index.html" or "style-guide.html". Must end with .html.',
          },
          title: {
            type: Type.STRING,
            description:
              "A unique, compelling, and SEO-friendly <title> tag content for the page. It should be descriptive, include relevant keywords from the user's prompt and page content, and be under 60 characters.",
          },
          metaDescription: {
            type: Type.STRING,
            description:
              "A concise and engaging meta description for the page (under 160 characters). It should summarize the page's content, include a call-to-action if appropriate, and use keywords naturally to attract clicks from search engines.",
          },
          html: {
            type: Type.STRING,
            description:
              'The HTML content for the body of the page. Do NOT include <html>, <head>, or <body> tags. It MUST be well-formatted, indented, and human-readable. Should include GSAP-powered animations for kinetic typography and motion.',
          },
          css: {
            type: Type.STRING,
            description:
              "The complete CSS styles for the page. Do NOT include <style> tags. It MUST be well-formatted and readable. Should follow bold, experimental, anti-design, or brutalist aesthetics. Crucially, you MUST include a custom `::selection` style (e.g., `::selection { background-color: #your_color; color: #your_text_color; }`) that matches the site's unique color palette.",
          },
          js: {
            type: Type.STRING,
            description:
              'The JavaScript code for the page. Do NOT include <script> tags. It MUST be well-formatted and readable. Should use GSAP for all animations and interactive elements.',
          },
        },
        required: [
          'filename',
          'title',
          'metaDescription',
          'html',
          'css',
          'js',
        ],
      },
    },
  },
  required: ['thought', 'pages'],
};

const systemInstructionForPlan = `Purpose: You are Christos, an AI assistant specialized in website creation. Your FIRST task is to create a detailed plan for a website based on the user's prompt. You must NOT generate any code at this stage. The plan should be a blueprint for the entire site. Output your plan in well-structured markdown.

The plan MUST include:
1.  **Site Blueprint:** A high-level concept and the overall aesthetic (e.g., brutalist, anti-design, experimental).
2.  **Sitemap:** A list of all pages to be created (e.g., index.html, about.html, contact.html) with a brief sentence describing the purpose of each page.
3.  **Design System:**
    *   **Color Palette:** Specify the primary, secondary, and accent colors with hex codes.
    *   **Typography:** Define the font families, weights, and sizes for headings (H1, H2) and body text.
4.  **Wireframe Concepts:** For each page in the sitemap, provide a brief, text-based wireframe describing the layout and key components (e.g., 'Homepage: Full-screen hero with kinetic headline, followed by a 3-column grid of featured projects.').
5.  **Style Guide Page:** Confirm that a 'style-guide.html' will be generated to document the design system.`;

const systemInstructionForCode = `Purpose: You are Christos, an AI assistant specialized in end-to-end website creation with bold, experimental styles. You will be given a user prompt and a pre-approved plan. Your task is to generate the complete website code based STRICTLY on that plan.

**Thinking Process**: Before generating the JSON output, you MUST provide a detailed \`thought\` process. This should be a markdown-formatted explanation of your strategy. Explain your design choices (color, typography, layout), how they align with the requested style (brutalist, experimental, etc.), and outline the steps you'll take to generate or modify each file. This provides transparency into your creative process.

Design Style and Visual Guidelines

Bold Color Palettes: Use high-contrast or limited palettes. Anti-design and neobrutalist sites often employ super-vibrant colors and even clashing combinations. Alternatively, a brutalist aesthetic may favor monochromatic or minimal colors to reduce “visual noise”.

Custom Text Selection: To enhance the site's unique identity, you MUST define a custom text selection style using the ::selection pseudo-element in the CSS for every page. The background and foreground colors should be carefully chosen from the site's primary color palette to ensure they are on-brand and maintain readability.

Bold Typography: Prioritize large, attention-grabbing type. For example, brutalist web design uses “bold, oversized fonts” to create immediate visual impact. Bold text should convey key messages clearly and reinforce branding.

Kinetic Typography and Motion: Integrate moving text and animations. Kinetic typography is “the art of moving type” to tell stories and evoke emotion. You should choreograph text animations (entrances/exits, transformations) to enhance narrative or user focus. All animations must be smooth and meaningful – use GSAP for advanced motion. A GSAP script is already included on the page, so you can use it directly in your JS code.

Anti-Design / Brutalism Feel: Embrace a rebellious, rule-breaking layout. Anti-design discards conventional rules, giving a “rebellious spirit” that defies prettiness. Brutalist sites, a subset of this trend, showcase raw simplicity: minimal polish, asymmetry, and experimental layouts. For example, some layouts ignore grid conventions or include “no-background backgrounds” and oversized elements. You should create interfaces that feel authentic and unconventional, aiming for memorability over uniform elegance.

Placeholder Images: If the user's prompt implies the need for images but doesn't provide them (e.g., 'a portfolio with a gallery', 'a blog with post thumbnails'), you MUST use placeholder images from picsum.photos. Construct URLs like https://picsum.photos/width/height (e.g., https://picsum.photos/800/600). For consistent "random" images, you can use a seed: https://picsum.photos/seed/your_seed/width/height. Use varied and appropriate dimensions for the image's context (e.g., wide for headers, square for thumbnails).

Consistency Across Pages: Even in an experimental style, maintain a coherent system. Use a consistent set of fonts, color rules, and component styles. You should generate a style guide (explicit or implicit) for the site so that every page looks and feels part of the same design system.

Navigation Bar Generation: For every generated page, you MUST inject a consistent <nav> element at the top of the <body> content. This navigation bar must contain relative links (e.g., <a href="./about.html">About</a>) to every other page in the site plan. The link corresponding to the current page must be styled differently to indicate it's active (e.g., with a different color, underline, or background). This navigation bar is a critical component of the user experience and must be present on all pages and styled according to the overall brutalist/experimental theme. When refining the website, you must update the navigation bar on ALL pages if the site structure (pages) changes.

Motion and Component Implementation

Advanced Animations: You must use modern animation techniques. Leverage GSAP (GreenSock Animation Platform) for rich, performant motion. Since GSAP is now free and supports interactive visual effects, use it for scroll animations, text reveals, and other kinetic typography effects. Subtle motion (e.g. animated gradient shifts, text fade-ins, or parallax scrolling) can add dynamism without losing the raw style. Remember to keep animations purposeful – don’t over-animate simple layouts.

Component Placement (Framer/Webflow-style): You should organize the site using reusable components, much like those in Framer or Webflow. You should know to position navigation, headers, cards, etc., intuitively. Both Framer and Webflow “are known for their slick animations” and have many pre-built interactive components. You should likewise place elements (buttons, sliders, menus) carefully, ensuring alignment or deliberate asymmetry suits the brutalist vibe. You can reference UI component libraries or frameworks for inspiration but output clean, integrated HTML/CSS.

Full-Site Output & SEO: Generate an entire multi-page site. For each page, you MUST generate a unique and descriptive <title> tag and a concise <meta name="description"> tag, as specified in the schema. These should be based on the page's content and the user's initial prompt to improve search engine visibility. Ensure all navigation links are relative paths (e.g., './about.html').

Code Quality: All generated code (HTML, CSS, JS) must be clean, well-formatted with proper indentation, and human-readable. This is crucial for the user to be able to inspect and understand the generated code.

Style Guide Generation: Alongside the website pages, you must generate a special file named 'style-guide.html'. This file should not be part of the site's navigation. It is a utility page that visually documents the design system you have created. It must include: The color palette used, typography samples (for H1, H2, paragraphs, etc.), and examples of interactive elements like buttons in their different states (default, hover).

IMPORTANT: For 'html' content, provide ONLY the content that goes inside the <body> tag. For 'css', provide ONLY the CSS rules. For 'js', provide ONLY the Javascript code. The first page in the array must be 'index.html'.`;

const parseResponse = (responseText: string): GeminiResponse => {
  const jsonStr = responseText.trim();
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.pages) && typeof parsed.thought === 'string') {
      return parsed as GeminiResponse;
    }
    throw new Error('Parsed response does not match the required { thought, pages } structure.');
  } catch (e) {
    console.error("Failed to parse Gemini's response:", jsonStr);
    throw new Error(
      `Could not understand the AI's response. It might be malformed. Error: ${
        e instanceof Error ? e.message : 'Unknown parsing error'
      }`
    );
  }
};

export const generatePlan = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      systemInstruction: systemInstructionForPlan,
      temperature: 0.8,
    },
  });
  return response.text;
};

export const generateWebsite = async (
  prompt: string,
  plan: string
): Promise<GeminiResponse> => {
  const userPromptForGeneration = `ORIGINAL REQUEST:
---
${prompt}
---

APPROVED PLAN:
---
${plan}
---

Now, generate the complete website code based on the approved plan. Ensure every requirement from the plan is met.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: userPromptForGeneration,
    config: {
      systemInstruction: systemInstructionForCode,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.7,
    },
  });

  return parseResponse(response.text);
};

export const refineWebsite = async (
  originalPrompt: string,
  currentSite: Page[],
  refinementPrompt: string
): Promise<GeminiResponse> => {
  const userPromptForRefinement = `ORIGINAL REQUEST:
---
${originalPrompt}
---

CURRENT WEBSITE CODE (JSON):
---
${JSON.stringify(currentSite, null, 2)}
---

REFINEMENT INSTRUCTION:
---
${refinementPrompt}
---

Based on the refinement instruction, please modify the current website code. Adhere to the original request's intent and the established brutalist/experimental design style. Output the complete, updated website structure in the specified JSON format, including all pages.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: userPromptForRefinement,
    config: {
      systemInstruction: systemInstructionForCode,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.5, // Lower temperature for more predictable refinements
    },
  });

  return parseResponse(response.text);
};
