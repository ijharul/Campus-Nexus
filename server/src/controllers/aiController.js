import OpenAI from 'openai';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @desc    Analyze Resume Text against standard tech-industry patterns
 * @route   POST /api/ai/analyze-resume
 * @access  Private
 */
export const analyzeResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    let textToAnalyze = resumeText;

    if (req.file && !textToAnalyze) {
        textToAnalyze = `[User uploaded a resume file: ${req.file.originalname}]. Please analyze based on the provided text or prompt the user for content.`;
    }

    if (!textToAnalyze) {
      res.status(400);
      throw new Error('Please provide resume text or upload a file for analysis.');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Lazy Reset: Check if it's a new day
    const now = new Date();
    const lastUsed = user.lastUsedAI ? new Date(user.lastUsedAI) : null;
    
    const isNewDay = !lastUsed || 
      now.getFullYear() !== lastUsed.getFullYear() || 
      now.getMonth() !== lastUsed.getMonth() || 
      now.getDate() !== lastUsed.getDate();

    if (isNewDay) {
      user.aiCallsToday = 0;
      user.lastUsedAI = now;
    }

    // Enforcement: 5 requests per day limit
    if (user.aiCallsToday >= 5) {
      res.status(429);
      throw new Error('Daily AI limit reached (5/5). Your quota will reset tomorrow.');
    }

    if (user.tokens < 1) {
       res.status(403);
       throw new Error('Insufficient Tokens. Please engaged with the platform to earn more.');
    }

    const prompt = `You are an elite Senior Tech Recruiter. Analyze the following resume text and respond ONLY in valid JSON format. Provide 3 specific strengths, 3 weaknesses, and 3 actionable suggestions for improvement.
    The required JSON schema is:
    {
      "strengths": ["...", "...", "..."],
      "weaknesses": ["...", "...", "..."],
      "suggestions": ["...", "...", "..."]
    }

    Resume Content:
    ${textToAnalyze}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    
    // Increment usage and deduct tokens
    user.aiCallsToday += 1;
    user.tokens -= 1;
    await user.save();

    res.json(parsedResponse);
  } catch (error) {
    if (error.code === 'invalid_api_key') {
       res.status(500);
       return next(new Error('OpenAI API Configuration is invalid or missing.'));
    }
    next(error);
  }
};

/**
 * @desc    Generate generic step-by-step career path structure
 * @route   POST /api/ai/career-roadmap
 * @access  Private
 */
export const generateRoadmap = async (req, res, next) => {
  try {
    const { goal } = req.body;

    if (!goal) {
      res.status(400);
      throw new Error('Please provide career goal parameters.');
    }

    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    // Lazy Reset
    const now = new Date();
    const lastUsed = user.lastUsedAI ? new Date(user.lastUsedAI) : null;
    const isNewDay = !lastUsed || now.toDateString() !== lastUsed.toDateString();

    if (isNewDay) {
      user.aiCallsToday = 0;
      user.lastUsedAI = now;
    }

    if (user.aiCallsToday >= 5) {
      res.status(429);
      throw new Error('Daily AI limit reached (5/5).');
    }

    if (user.tokens < 1) {
      res.status(403);
      throw new Error('Insufficient Tokens.');
    }

    const prompt = `You are an expert Career Coach mentoring a junior technologist. Generate a detailed roadmap to achieve the goal: "${goal}".
    Respond ONLY in valid JSON format using the exact schema below:
    {
      "requiredSkills": ["skill1", "skill2", "skill3"],
      "recommendedTechnologies": ["tech1", "tech2", "tech3"],
      "roadmap": [
        { "step": "Step 1 name", "description": "Details about step 1" },
        { "step": "Step 2 name", "description": "Details about step 2" }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const parsedResponse = JSON.parse(completion.choices[0].message.content);

    user.aiCallsToday += 1;
    user.tokens -= 1;
    await user.save();

    res.json(parsedResponse);
  } catch (error) {
     next(error);
  }
};

/**
 * @desc    Generates Skills Gap Analysis matrix
 * @route   POST /api/ai/skills-gap
 * @access  Private
 */
export const analyzeSkillsGap = async (req, res, next) => {
  try {
    const { currentSkills, targetRole } = req.body;

    if (!currentSkills || !targetRole) {
      res.status(400);
      throw new Error('Please provide both currentSkills and targetRole.');
    }

    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    // Lazy Reset
    const now = new Date();
    const lastUsed = user.lastUsedAI ? new Date(user.lastUsedAI) : null;
    const isNewDay = !lastUsed || now.toDateString() !== lastUsed.toDateString();

    if (isNewDay) {
      user.aiCallsToday = 0;
      user.lastUsedAI = now;
    }

    if (user.aiCallsToday >= 5) {
      res.status(429);
      throw new Error('Daily AI limit reached (5/5).');
    }

    if (user.tokens < 1) {
      res.status(403);
      throw new Error('Insufficient Tokens.');
    }


    const prompt = `You are an expert Technical Hiring Manager.
    Compare these current skills: [${currentSkills.join(', ')}] against the requirements for this target role: "${targetRole}".
    Respond ONLY in valid JSON format utilizing this schema sequence:
    {
      "missingSkills": ["skill needed 1", "skill needed 2"],
      "priorityLearningList": [
        { "skill": "Most critical missing skill", "reason": "Why learn this first" }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    
    user.aiCallsToday += 1;
    user.tokens -= 1;
    await user.save();

    res.json(parsedResponse);
  } catch (error) {
    next(error);
  }
};
