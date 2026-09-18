import { Dhikr, Hadith, QuranVerse } from '../types';

/**
 * Copy text with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch {
    return false;
  }
}

export function formatDhikrForSharing(dhikr: Dhikr): string {
  let content = `« ${dhikr.arabic} »\n\n`;
  if (dhikr.translation) {
    content += `Translation: ${dhikr.translation}\n\n`;
  }
  content += `التكرار: ${dhikr.count === 1 ? 'مرة واحدة' : `${dhikr.count} مرات`}\n`;
  if (dhikr.virtue) {
    content += `الفضل: ${dhikr.virtue}\n`;
  }
  if (dhikr.source || dhikr.reference) {
    content += `المصدر: ${dhikr.source || dhikr.reference}\n`;
  }
  content += `— عبر سكينة | Sakinah`;
  return content;
}

export function formatHadithForSharing(hadith: Hadith): string {
  let content = `${hadith.narratorAr}\n\n« ${hadith.arabic} »\n\n`;
  if (hadith.english) {
    content += `Translation:\n"${hadith.english}"\n\n`;
  }
  content += `المصدر: ${hadith.book} (${hadith.number}) - ${hadith.grade}\n— عبر سكينة | Sakinah`;
  return content;
}

export function formatVerseForSharing(verse: QuranVerse): string {
  return `قال الله تعالى:\n« ${verse.arabic} »\n[${verse.surahAr}: ${verse.ayahNumber}]\n\n"${verse.translation}"\n— عبر سكينة | Sakinah`;
}
