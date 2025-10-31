import { GoogleGenAI } from "@google/genai";
import { MeetingPart } from "../types";
import { marked } from 'marked';

// IMPORTANT: This assumes the API_KEY is set in the environment variables.
// Do not add any UI for entering the API key.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Extracts the ministry setting from the part's title or references.
 * @param part The meeting part object.
 * @returns A string representing the setting or null if not found.
 */
const getMinistrySetting = (part: MeetingPart): string | null => {
    const combinedText = `${part.titulo} ${part.referencias?.join(' ') || ''}`.toLowerCase();
    if (combinedText.includes('de casa em casa') || combinedText.includes('house to house')) return 'House to House';
    if (combinedText.includes('testemunho informal') || combinedText.includes('informal witnessing')) return 'Informal Witnessing';
    if (combinedText.includes('testemunho público') || combinedText.includes('public witnessing') || combinedText.includes('território comercial') || combinedText.includes('business territory')) return 'Public Witnessing';
    return null;
};

const generatePrompt = (part: MeetingPart, instructions: string): string => {
    const setting = getMinistrySetting(part);

    const baseIntro = `
        You are an experienced instructor for the 'Our Christian Life and Ministry' meeting, providing helpful advice to students.
        A student has been assigned the following part:

        - **Part Title:** ${part.titulo}
        - **Type of Part:** ${part.tipo.replace(/_/g, ' ')}
        ${setting ? `- **Setting:** ${setting}` : ''}
        - **Duration:** ${part.duracaoMin} minutes
        ${part.referencias ? `- **Key References:** ${part.referencias.join(', ')}` : ''}
        ${part.tema ? `- **Theme:** ${part.tema}` : ''}

        Here are the general official instructions for this type of assignment:
        "${instructions}"
    `;

    let specificRequest = '';

    switch (part.tipo) {
        case 'reading':
            specificRequest = `
                Please provide specific tips on how to deliver this Bible reading from **${part.referencias?.join(', ') || 'the assigned passage'}** effectively. Focus on:
                - **Accuracy:** Point out any potentially difficult names or places in the text and suggest how to pronounce them correctly.
                - **Understanding:** Briefly explain the context of the passage to help the student grasp its meaning.
                - **Fluency and Naturalness:** How to read smoothly and conversationally, not mechanically.
                - **Sense Stress:** Suggest key words or phrases to emphasize to bring out the meaning.
                - **Pausing:** Recommend logical places to pause to allow the audience to reflect.
            `;
            break;
        case 'starting_conversation':
        case 'following_up':
            specificRequest = `
                Please provide practical tips for this ministry demonstration. The student should focus on being conversational and natural. 
                ${setting ? `Tailor your advice specifically for the **${setting}** setting.` : ''}
                Give advice on:
                - **Opening:** How to start the conversation in a warm and engaging way.
                - **Using the Scriptures:** How to introduce and discuss a bible verse without sounding preachy.
                - **Laying Groundwork:** How to effectively set up a return visit or continue the conversation next time.
                - **Adapting:** How to adapt the sample conversation to a realistic, local scenario.
            `;
            break;
        case 'making_disciples':
            specificRequest = `
                This part demonstrates a portion of an ongoing Bible study using **${part.referencias?.join(', ') || 'the assigned material'}**. Please provide tips on:
                - **Focusing the Segment:** How to effectively teach just one or two main points from the assigned material within the time limit without rushing.
                - **Engaging the Student:** How to use effective questions (not just asking for the answer from the book) and simple illustrations to involve the "householder" and ensure they understand the 'why'.
                - **Using the Publication:** How to balance reading from the study material with natural, friendly conversation.
                - **Practical Application:** How to help the "householder" connect the lesson to their own life.
            `;
            break;
        case 'explaining_beliefs':
            specificRequest = `
                This part involves tactfully explaining the belief related to the theme: **"${part.tema || part.titulo}"**, based on **${part.referencias?.join(', ') || 'the provided information'}**. Please give tips on:
                - **Structuring the Answer:** How to give a simple, clear, and logical answer that directly addresses the question.
                - **Using Scripture:** How to reason on a key scripture from the references, explaining it simply.
                - **Maintaining Tact:** How to be warm, respectful, and kind, avoiding a confrontational tone.
                - **Illustrations:** Suggest a simple analogy or illustration to make the point easier to understand.
            `;
            break;
        case 'student_talk':
            specificRequest = `
                This is a talk delivered to the congregation on the theme: **"${part.tema || 'the assigned topic'}"**. The key is to show how the material from **${part.referencias?.join(', ') || 'the references'}** can be applied in the ministry. Provide tips on:
                - **Structuring the Talk:** How to organize the talk with a clear introduction that grabs attention, a body that develops the theme, and a memorable conclusion.
                - **Ministry Application:** Give concrete examples of how a publisher could use the key points or scriptures from this talk when witnessing house-to-house, informally, or on a return visit.
                - **Engaging the Audience:** How to use questions, a brief real-life example, or an illustration to connect with the congregation.
                - **Staying on Theme:** How to ensure every part of the talk directly supports the assigned theme.
            `;
            break;
        default:
            specificRequest = `
                Please provide 3-5 concise, practical, and encouraging preparation tips for the student.
            `;
    }

    const conclusion = `
        Based on all this information, provide 3-5 concise, practical, and encouraging preparation tips.
        Format the response in Markdown with a main heading "Preparation Tips for '${part.titulo}'" and a bulleted list of tips.
        The tone should be warm, encouraging, and helpful.
    `;

    return `${baseIntro}
${specificRequest}
${conclusion}`;
};


export async function getPreparationTips(part: MeetingPart, instructions: string): Promise<string> {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }

    const prompt = generatePrompt(part, instructions);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the API.");
        }
        
        // Convert markdown to HTML for safe rendering
        return marked(text) as string;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate tips from Gemini API.");
    }
}