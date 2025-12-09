export type DateRange = {
    start: string;
    end: string;
  };
  
  const formatISO = (date: Date): string => date.toISOString().slice(0, 10);
  

  export function generateDateRange(start: string, end: string): string[] {
    const result: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return result;
    if (startDate > endDate) return result;
  
    const current = new Date(startDate);
    while (current <= endDate) {
      const iso = formatISO(current);
      result.push(iso);
      current.setDate(current.getDate() + 1);
    }
    return result;
  }
  

  export function getNextWeekRange(today: Date = new Date()): DateRange {
    const day = today.getDay(); 
    const diffToMonday = (1 - day + 7) % 7;
  
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + diffToMonday);
  
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
  
    return {
      start: formatISO(nextMonday),
      end: formatISO(nextSunday),
    };
  }
  

  export function getNextMonthRange(today: Date = new Date()): DateRange {
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  
    return {
      start: formatISO(nextMonthStart),
      end: formatISO(nextMonthEnd),
    };
  }
  