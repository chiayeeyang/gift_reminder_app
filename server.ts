import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// AI Gift Idea Brainstorming
app.post('/api/ai/brainstorm', async (req, res) => {
  try {
    const {
      recipientName,
      relationship,
      occasion,
      interests,
      budget,
      giftPreference, // 'handmade' | 'bought'
      additionalNotes,
    } = req.body;

    const ai = getAIClient();
    const chosenType = giftPreference === 'bought' ? 'bought' : 'handmade';

    const prompt = `You are an elite, highly personalized gift advisor and creative artisan.
The user wants ultra-personalized gift recommendations based on the recipient's specific hobbies, preferences, and interests.

INPUT PROFILE:
- Recipient: ${recipientName || 'a loved one'}
- Relationship: ${relationship || 'friend/family/partner'}
- Occasion: ${occasion || 'Birthday/Special Occasion'}
- Hobbies, Skills & Interests: ${interests || 'General hobbies'}
- Extra Context / Preferences: ${additionalNotes || 'None'}
- Target Emerald Budget: ${budget ? `$${budget}` : 'Flexible'}
- Mandatory Gifting Preference: STRICTLY "${chosenType}" (${chosenType === 'handmade' ? '100% Hand-crafted DIY gifts only' : '100% Curated bought gifts to purchase only'}). Every single idea MUST have "type": "${chosenType}".

PERSONALIZATION & COMBINATION RULES (MANDATORY):
1. Extract the distinct factors/elements from the provided hobbies, interests, and preferences (for example, if interests are "Gardening, Coffee", Factor A is "Gardening" and Factor B is "Coffee").
2. COMBINATION REQUIREMENT:
   - Generate an idea that directly and creatively COMBINES 2-3 of the input factors together into one cohesive, unique, deeply personalized concept. (e.g. if inputs are Gardening + Coffee, create a gift that merges both, such as a cold-brew botanicals cultivation kit or handmade coffee-ground soil enricher with handcrafted terracotta planter).
   - Label this idea with "combinationType": "combination" and "inspiredBy": "Combo: [Factor 1] + [Factor 2]".
3. SEPARATE FOCUS REQUIREMENT:
   - The REST of the ideas MUST focus individually on the separate factors.
   - For example, if there are 2 factors (A and B): generate 1 idea combining A & B, plus 1 idea focusing specifically on A, and 1 idea focusing specifically on B (at least 3 ideas total, or 4-5 if expanded).
   - If there are 3 factors (A, B, C): generate 1 idea combining 2-3 factors, plus ideas dedicated individually to Factor A, Factor B, and Factor C.
   - Label each separate idea with "combinationType": "single_factor" and "inspiredBy": "Focus: [Factor Name]".
4. GIFTING PREFERENCE ENFORCEMENT:
   - If Gifting Preference is "handmade", ALL ideas must be hand-crafted projects with realistic crafting hours, difficulty, step-by-step supplies, and DIY instructions.
   - If Gifting Preference is "bought", ALL ideas must be commercially available/artisan products to buy with exact shop/brand/marketplace sourcing, craftingHours: 0, and difficulty: "N/A".
5. COST SENSITIVITY:
   - Keep estimated costs aligned with the Target Budget (${budget ? `$${budget}` : 'reasonable budget'}).

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects (pure JSON string, no markdown wrappers, no backticks):
[
  {
    "title": "Short, creative, specific title of the gift",
    "type": "${chosenType}",
    "combinationType": "combination",
    "inspiredBy": "Combo: [Factor 1] + [Factor 2]",
    "description": "2-3 vivid sentences describing what this gift is, why it was chosen specifically for them, and how it directly expresses their specific hobbies/preferences.",
    "estimatedCost": 35,
    "craftingHours": ${chosenType === 'handmade' ? '3' : '0'},
    "difficulty": "${chosenType === 'handmade' ? 'Easy' : 'N/A'}",
    "suppliesNeeded": ["specific item or supply 1", "specific item or supply 2"],
    "whereToFindOrMake": "Exact marketplace/shops or DIY craft technique",
    "leadTimeAdvice": "Timeline advice for making or ordering"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '[]';
    // Clean potential markdown wrap and extract JSON array
    let cleaned = text.trim();
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    } else {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    const ideas = JSON.parse(cleaned);

    res.json({ ideas });
  } catch (err: any) {
    console.error('Brainstorm error:', err);
    res.status(500).json({
      error: err.message || 'Failed to brainstorm gift ideas',
      fallback: true,
    });
  }
});

// AI Handmade Craft Planner
app.post('/api/ai/craft-planner', async (req, res) => {
  try {
    const { giftTitle, recipientName, availableHours, skillLevel } = req.body;
    const ai = getAIClient();

    const prompt = `You are a master craftsperson and DIY instructor. Create an actionable crafting plan for a handmade gift:
Gift: "${giftTitle}"
For: "${recipientName || 'Gift Recipient'}"
Estimated Available Crafting Time: ${availableHours ? availableHours + ' hours' : 'Flexible'}
Crafter Skill Level: ${skillLevel || 'Beginner/Intermediate'}

Return ONLY a valid JSON object (no markdown formatting, no code block markers) with the following structure:
{
  "title": "${giftTitle}",
  "estimatedTotalHours": 4,
  "difficulty": "Easy",
  "estimatedMaterialCost": 15,
  "materialsList": [
    { "name": "Material item", "approxCost": 5, "whereToGet": "Craft store / Home" }
  ],
  "timelineSchedule": [
    { "phase": "Gathering & Prep", "estimatedDaysBefore": 14, "hours": 1, "task": "..." },
    { "phase": "Core Crafting", "estimatedDaysBefore": 7, "hours": 2, "task": "..." },
    { "phase": "Finishing & Wrapping", "estimatedDaysBefore": 2, "hours": 1, "task": "..." }
  ],
  "stepByStep": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "proTips": [
    "Tip 1...",
    "Tip 2..."
  ],
  "packagingIdea": "Creative packaging suggestion to make the handmade gift look stunning"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const plan = JSON.parse(cleaned);

    res.json({ plan });
  } catch (err: any) {
    console.error('Craft planner error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate craft plan',
    });
  }
});

// Setup Vite development middleware or production static handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
