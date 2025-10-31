// Gets the Monday of the week for a given date
const getMonday = (d: Date): Date => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const getWeekId = (d: Date): string => {
    const monday = getMonday(d);
    const year = monday.getFullYear();
    const month = (monday.getMonth() + 1).toString().padStart(2, '0');
    const date = monday.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${date}`;
};

export const formatWeekLabel = (d: Date, lang: 'pt' | 'en'): string => {
    const monday = getMonday(new Date(d));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
    
    const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(monday);
    const year = monday.getFullYear();

    if (lang === 'pt') {
        return `${monday.getDate()}-${sunday.getDate()} de ${monthName} de ${year}`;
    } else {
        return `${monthName} ${monday.getDate()}-${sunday.getDate()}, ${year}`;
    }
};

export function getWeekNumber(d: Date): [number, number] {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return [date.getFullYear(), 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)];
}
