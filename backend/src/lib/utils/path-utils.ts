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
      collectionName: string;
      collectionPath: string;
      seasonNumber?: number;
      seasonName?: string;
    }
  | undefined {
  if (!videoPath) return undefined;

  const hasDotPrefix = videoPath.startsWith('./');

  const parts = videoPath.replace(/^\.\//, '').split('/').filter(Boolean);
  if (parts.length < 2) return undefined;

  const fileName = parts[parts.length - 1];
  if (!fileName.includes('.')) return undefined;

  const videoName = fileName.replace(/\.[^/.]+$/, '');

  const possibleSeason = parts[parts.length - 2];
  const hasSeason = /^season\s*\d+/i.test(possibleSeason);

  const collectionName = hasSeason
    ? parts[parts.length - 3]
    : parts[parts.length - 2];

  const collectionIndex = parts.indexOf(collectionName);
  if (collectionIndex === -1) return undefined;

  const collectionPath =
    (hasDotPrefix ? './' : '') + parts.slice(0, collectionIndex + 1).join('/');

  let seasonNumber: number | undefined;
  let seasonName: string | undefined;

  if (hasSeason) {
    seasonName = possibleSeason;
    const match = possibleSeason.match(/\d+/);
    if (match) {
      seasonNumber = parseInt(match[0], 10);
    }
  }

  return {
    videoName,
    collectionName,
    collectionPath,
    ...(seasonNumber !== undefined && { seasonNumber }),
    ...(seasonName !== undefined && { seasonName }),
  };
}

export function getFileIndex(folderPath: string, fileName: string) {
  const files = fs.readdirSync(folderPath);
  const sortedFiles = files.sort((a, b) => a.localeCompare(b));

  const index = sortedFiles.findIndex((f) => f.includes(fileName));

  return index !== -1 ? index : 0;
}
