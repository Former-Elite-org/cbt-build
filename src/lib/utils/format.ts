// Formatting utility functions

export const formatNumber = (n: number | string = 0): string => {
  if (typeof n !== 'number' && typeof n !== 'string') {
    return '0';
  }

  const num = parseFloat(String(n));

  if (isNaN(num)) {
    return '0';
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDuration = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) return `${hrs}hr ${mins}mins`;
  if (hrs) return `${hrs}hr`;
  return `${mins}mins`;
};

export const getAlpha = (index: number): string => {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabets[index] || '';
};

export const toTitleCase = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const toParagraph = (text: string): string => {
  if (!text) return '';
  
  const paragraphs = text.split('\n');
  
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      return trimmed.length > 0
        ? trimmed[0].toUpperCase() + trimmed.slice(1)
        : '';
    })
    .filter((p) => p.length > 0)
    .join('\n');
};

export const separator = (num: number | string): string => {
  const x = Number(num);
  return x.toLocaleString('en-US');
};

