
export function cleanTitle(name: string): string {
  if (!name) return '';
  
  let cleaned = name;
  
  // Remove decorative lines/dashes
  cleaned = cleaned.replace(/[─━˗―]{3,}/g, '');
  cleaned = cleaned.replace(/─────+/g, '');
  
  // Remove technical labels
  cleaned = cleaned.replace(/(VID ID|PDF ID)\s*\d+/gi, '');
  cleaned = cleaned.replace(/[🎥📑]?\s*ᴛɪᴛʟᴇ/gi, '');
  cleaned = cleaned.replace(/ᴛɪᴛʟᴇ/gi, '');
  
  // Remove credits and social handles
  cleaned = cleaned.replace(/ᴇxᴛʀᴀᴄᴛᴇᴅ ʙʏ|Extracted By/gi, '');
  cleaned = cleaned.replace(/@\w+/gi, '');
  
  // Remove batch info specifically
  cleaned = cleaned.replace(/ʙᴀᴛᴄʜ\s+\w+/gi, '');
  
  // Remove resolution tags
  cleaned = cleaned.replace(/\[\d+x\d+p?\]/gi, '');
  
  // Remove redundant extensions
  cleaned = cleaned.replace(/\.mp4\.mp4/gi, '');
  
  // Remove decorative symbols
  cleaned = cleaned.replace(/[💠💠🎥📑💠🔹🔸📍📎✅]/gu, '');
  
  // Clean up whitespace and extra dashes
  cleaned = cleaned.replace(/\s*-\s*-\s*/g, ' - ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // If it starts with a dash or space, trim it
  cleaned = cleaned.replace(/^[\s\-]+/, '');
  
  // If it ends with a dash, trim it
  cleaned = cleaned.replace(/[\s\-]+$/, '');

  return cleaned;
}

export function extractNumericId(name: string): number | null {
  if (!name) return null;
  const match = name.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
