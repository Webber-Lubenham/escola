import { WeeklyProgram } from '../types';
import { weeklyProgramsPt, weeklyProgramsEn } from '../data/programs';
import { getWeekId, getWeekNumber } from '../utils/date';

type Language = 'pt' | 'en';

// This configuration would be used to build the real URL for scraping
const langConfig = {
    pt: { regionCode: 'r5', pubCode: 'lp-t', name: 'Português (Brasil)' },
    en: { regionCode: 'r1', pubCode: 'lp-e', name: 'English' },
};

// --- SIMULATION / PLACEHOLDER ---
// In a real application, this function would make an API call to a backend service.
// The backend would use a library like Cheerio or Puppeteer to scrape the
// official website (wol.jw.org) using the constructed URL.
// For this demo, we are simulating the fetch by using local mock data.

export async function fetchMeetingData(date: Date, lang: Language): Promise<WeeklyProgram | null> {
    console.log(`Fetching data for date: ${date.toDateString()}, lang: ${lang}`);
    
    // 1. Build the target URL (for a real backend)
    const [year, weekNum] = getWeekNumber(date);
    const config = langConfig[lang];
    const url = `https://wol.jw.org/${lang}/wol/meetings/${config.regionCode}/${config.pubCode}/${year}/${weekNum}`;
    console.log(`(In a real app, this service would fetch and parse: ${url})`);
    
    // 2. Simulate network delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 300));

    // 3. Find matching data in our local mock files for the simulation
    const weekId = getWeekId(date);
    const dataSource = lang === 'pt' ? weeklyProgramsPt : weeklyProgramsEn;
    const program = dataSource.find(p => p.idSemana === weekId);

    if (program) {
        return JSON.parse(JSON.stringify(program)); // Return a copy to avoid mutation
    } else {
        // In a real scraper, a 404 or an empty parse result would lead to this.
        console.warn(`No mock data found for week ID: ${weekId} in language: ${lang}`);
        return null;
    }
}
