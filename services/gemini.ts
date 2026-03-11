
import { GoogleGenAI, Type } from "@google/genai";
import { Course } from "../types";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function getCourseInsights(course: Course) {
  const ai = getGeminiClient();
  const prompt = `You are a world-class education consultant. Provide a deep knowledge brief for the following course:
  Title: ${course.title}
  Category: ${course.category}
  Description: ${course.description}
  
  Please provide:
  1. A "Mastery Roadmap" (4 logical phases of learning).
  2. "Key Technical Concepts" (3-5 items).
  3. "Career Impact" (A brief paragraph on how this helps a professional).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      topP: 0.95,
    },
  });

  return response.text;
}

export async function getLessonTakeaways(courseTitle: string, lessonTitle: string) {
  const ai = getGeminiClient();
  const prompt = `Course: ${courseTitle}. Lesson: ${lessonTitle}. 
  Provide 3 high-impact technical takeaways from this specific lesson. 
  Format as a short bulleted list. Use professional, encouraging language.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
}

export async function getCareerRoadmap(goal: string) {
  const ai = getGeminiClient();
  const prompt = `Goal: ${goal}. Create a 4-week intensive learning roadmap to achieve this career goal. 
  Include specific skills to master each week and a final 'Capstome' project idea.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return response.text;
}

export async function getCareerPathOutlook(pathTitle: string) {
  const ai = getGeminiClient();
  const prompt = `Career Path: ${pathTitle}
  
  Generate a concise (max 40 words) market outlook for this career path in 2025. Mention expected salary growth trends and one "must-have" emerging skill.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
}

export async function getEnrollmentROI(course: Course) {
  const ai = getGeminiClient();
  const prompt = `Course: ${course.title}
  Category: ${course.category}
  Price: $${course.price}
  
  Generate a one-sentence, highly motivational "Return on Investment" statement for a professional considering buying this course. Focus on career growth or time saved.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
}

export async function getSignUpMotivation(course: Course) {
  const ai = getGeminiClient();
  const prompt = `Course Category: ${course.category}
  Course Title: ${course.title}
  
  Generate a very short, high-energy welcome message (max 15 words) for a new user about to sign up to our platform. Mention how this platform is the best place for ${course.category}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
}

export async function chatWithTutor(course: Course, message: string, history: any[]) {
  const ai = getGeminiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the AI Tutor for the course "${course.title}". 
      You have deep expertise in ${course.category}. Your goal is to provide specific, 
      expert-level knowledge to students. Be encouraging, technical, and concise.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function globalChat(message: string) {
  const ai = getGeminiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the Global AI Assistant. This is a world-class professional learning platform. 
      You help users with career advice, learning strategies, and technical questions. 
      Be encouraging, professional, and helpful. You can suggest topics like Web Dev, Data Science, and UI/UX.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function getIndustryBrief(topic: string) {
  const ai = getGeminiClient();
  const prompt = `Topic: ${topic}. 
  Provide a "Knowledge Brief" for a professional. 
  Include: 
  - Current state of the industry (2025 context)
  - 3 critical skills to master
  - A short 'Expert Perspective' on why this matters for career growth. 
  Keep it under 200 words.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
}
