import { format, parseISO, addMinutes, differenceInMinutes } from 'date-fns';

// Date utility functions using date-fns (replacing Moment.js)

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

export const convertTo24Hour = (timeStr: string): string => {
  if (!timeStr || timeStr.length === 0) return '';
  
  // If already in 24-hour format (e.g., "13:45"), just return
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  
  // If in 12-hour format (e.g., "1:45 PM"), convert
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])$/);
  if (!match) return timeStr;
  
  let [, hour, minute, period] = match;
  let hourNum = parseInt(hour, 10);
  
  if (period.toUpperCase() === 'PM' && hourNum !== 12) hourNum += 12;
  if (period.toUpperCase() === 'AM' && hourNum === 12) hourNum = 0;
  
  return `${hourNum.toString().padStart(2, '0')}:${minute}`;
};

export const convertToAmPM = (timeStr: string): string => {
  if (!timeStr || timeStr.length === 0) return '';
  
  const [hour, minute] = timeStr.split(':');
  const hourNum = parseInt(hour, 10);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const formattedHour = hourNum % 12 || 12;
  
  return `${formattedHour}:${minute} ${period}`;
};

export const addDuration = (date: Date, minutes: number): Date => {
  return addMinutes(date, minutes);
};

export const getDuration = (start: Date, end: Date): number => {
  return differenceInMinutes(end, start);
};

