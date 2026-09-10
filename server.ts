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
      giftPreference, // 'both' | 'handmade' | 'bought'
      additionalNotes,
    } = req.body;

    const ai = getAIClient();

    const prompt = `You are an expert, thoughtful gift advisor who specializes in both curated bought gifts and heartfelt handmade/DIY projects.
Generate 5 distinct, personalized gift ideas for:
- Recipient: ${recipientName || 'a loved one'}
- Relationship: ${relationship || 'friend/family/partner'}
- Occasion: ${occasion || 'Birthday/Holiday'}
- Interests & Hobbies: ${interests || 'General'}
- Target Budget: ${budget ? `$${budget}` : 'Flexible'}
- Desired Gift Type: ${giftPreference || 'both bought and handmade'}
- Special Notes / Quirks: ${additionalNotes || 'None'}

Return ONLY a valid JSON array of objects (no Markdown backticks, no markdown formatting, pure JSON string) with each object having this exact structure:
[
  {
    "title": "Short catchy title of the gift",
    "type": "bought" or "handmade",
    "description": "2-3 sentences describing the gift and why it's deeply thoughtful",
    "estimatedCost": 25,
    "craftingHours": 3 (if handmade, number of estimated hours to create; 0 if bought),
    "difficulty": "Easy" | "Medium" | "Advanced" (if handmade; "N/A" if bought),
    "suppliesNeeded": ["supply 1", "supply 2"] (for handmade; for bought list key accessories or brands),
    "whereToFindOrMake": "Where to buy (e.g. Etsy, local bookstore, Amazon) or brief DIY method",
    "leadTimeAdvice": "Advice on when to start making or order (e.g. 'Start 2 weeks ahead' or 'Order 10 days before')"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '[]';
    // Clean potential markdown wrap
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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
