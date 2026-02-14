import * as fs from 'node:fs';

export function destructSubtitlePath(subtitlePath: string):
  | {
      name: string;
      language: string;
    }
  | undefined {
  const regex = /.*_([a-z]{2})_([a-zA-Z0-9]+)\.vtt$/;
  const match = subtitlePath.match(regex);

  if (!match) {
    return undefined;
  }

  const langCode = match[1];
  const name = match[2];

  return {
    name,
    language: langCode,
  };
}

export function destructVideoPath(videoPath: string):
  | {
      videoName: string;
      folderName: string;
      folderPath: string;
      seasonNumber?: number;
    }
  | undefined {
  const normalized = videoPath.replace(/\\/g, '/');
  const parts = normalized.split('/');

  const videosIndex = parts.findIndex((p) => p.toLowerCase() === 'videos1');
  if (videosIndex === -1 || videosIndex + 1 >= parts.length) {
    return undefined;
  }

  const folderName = parts[videosIndex + 1];
  const folderPath = parts.slice(0, videosIndex + 1).join('/');

  // Look for a folder containing 'season' (case-insensitive) after seriesOrMovie folder
  let seasonNumber: number | undefined;
  for (let i = videosIndex + 2; i < parts.length - 1; i++) {
    if (/season/i.test(parts[i])) {
      // Extract only digits from the season folder name
      const digits = parts[i].replace(/\D/g, '');
      if (digits.length > 0) {
        seasonNumber = parseInt(digits, 10);
        break;
      }
    }
  }

  const fileName = parts[parts.length - 1];
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

  let videoName = nameWithoutExt;
  if (seasonNumber) {
    const episodeMatch = nameWithoutExt.match(/S\d{2}E\d{2}\s*-\s*(.+)/i);
    if (episodeMatch) {
      videoName = episodeMatch[1].trim();
    }
  }

  return {
    folderName,
    seasonNumber,
    folderPath,
    videoName,
  };
}

export function getFileIndex(folderPath: string, fileName: string) {
  const files = fs.readdirSync(folderPath);
  const sortedFiles = files.sort((a, b) => a.localeCompare(b));

  const index = sortedFiles.findIndex((f) => f.includes(fileName));

  return index !== -1 ? index : 0;
}
