import React from 'react';
import type { Student } from './types';

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
export const ICONS: { [key: string]: React.ReactElement } = {
  treasures: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>,
  gems: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-1.718-.69-3.325-1.838-4.473a4.5 4.5 0 0 0-6.364 6.364l1.838 1.838c1.148 1.148 2.755 1.838 4.472 1.838 2.797 0 5.07-2.272 5.07-5.07z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.075c0 1.718.69 3.325 1.838 4.473a4.5 4.5 0 0 0 6.364-6.364l-1.838-1.838c-1.148-1.148-2.755-1.838-4.472-1.838-2.797 0-5.07 2.273-5.07 5.07z" /></svg>,
  reading: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
  ministry: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.282 2.72a3 3 0 0 1-4.682-2.72 9.094 9.094 0 0 1 3.741-.479m-3.741.479a3 3 0 0 0 4.682 2.72m-4.682-2.72a3 3 0 0 1 4.682 2.72m0 0a3 3 0 0 0 4.682-2.72m0 0a9.094 9.094 0 0 0-3.741-.479m-7.282 2.72a3 3 0 0 1-4.682-2.72" /></svg>,
  life: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.287 8.287 0 0 0 3-2.555 8.252 8.252 0 0 1 3.362-1.832Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>,
};

export const PART_TYPE_INSTRUCTIONS: { [key: string]: string } = {
    "talk": `This is a ten-minute talk assigned to an elder or qualified ministerial servant. The theme and outline are in the workbook. The speaker should cover the outlined points and can use related artwork and reference material to develop them.`,
    "gems": `This is a ten-minute question-and-answer part handled by an elder or qualified ministerial servant. There is no introduction or conclusion. Both questions should be asked to the audience, and comments should be 30 seconds or less.`,
    "reading": `This is a four-minute student assignment for a male student. The material should be read without introduction or conclusion. Focus is on accuracy, understanding, fluency, proper sense stress, modulation, pausing, and naturalness.`,
    "starting_conversation": `This student assignment can be for a male or female student. The goal is to share a simple, relevant Bible truth and lay the groundwork for a future conversation. Focus on natural conversation skills, not a memorized presentation. The setting (house-to-house, informal, public) should be adapted to local circumstances.`,
    "following_up": `This student assignment can be for a male or female student. It demonstrates what to say when following up on a previous conversation. The goal is to share a simple, relevant Bible truth and lay the groundwork for a future conversation. Focus on natural conversation skills.`,
    "making_disciples": `This student assignment for a male or female student demonstrates a segment of a Bible study in progress. No introduction or conclusion is needed unless working on that specific point. Not all material needs to be read aloud.`,
    "explaining_beliefs": `This assignment provides a clear and tactful answer to a theme question. When a talk, it's for a male student. When a demonstration, it can be for a male or female student.`,
    "student_talk": `This is a talk for a male student given to the congregation. It should focus on how to apply a specific point or verse from the 'Love People' brochure in the ministry.`,
};

export const PRIVILEGE_LIST: { key: keyof Student['privileges']; label: string }[] = [
    { key: 'chairman', label: 'Chairman' },
    { key: 'pray', label: 'Prayer' },
    { key: 'treasures', label: 'Treasures Talk' },
    { key: 'gems', label: 'Spiritual Gems' },
    { key: 'reading', label: 'Bible Reading' },
    { key: 'talk', label: 'Student Talk' },
    { key: 'startingConversation', label: 'Starting Conversation' },
    { key: 'followingUp', label: 'Following Up' },
    { key: 'makingDisciples', label: 'Making Disciples' },
    { key: 'explainingBeliefs', label: 'Explaining Beliefs' },
];