import ffmpeg from 'fluent-ffmpeg';
import { mkdir } from 'fs/promises';
import path from 'node:path';

/**
 * Gets the duration of a video file in seconds.
 * @param videoPath - Absolute or relative path to the video file
 * @returns Promise resolving to duration in seconds
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      const duration = metadata.format?.duration;
      if (typeof duration !== 'number') {
        return reject(new Error('Could not determine video duration'));
      }
      resolve(duration);
    });
  });
}

/**
 * Creates a snapshot image at the specified percentage of the video duration.
 * Returns the relative path to the snapshot image.
 * @param videoPath - Absolute or relative path to the video file
 * @param outputFolder - Folder where the snapshot image will be saved
 * @param outputFilename - Filename for the snapshot image (e.g., 'snapshot.png')
 * @param percentage - Number between 0 and 100 for the position in the video
 * @returns Promise resolving to the relative path of the generated snapshot image
 */
export async function snapshotAtPercentage(
  videoPath: string,
  outputFolder: string,
  outputFilename: string,
  percentage: number,
): Promise<string> {
  if (percentage < 0 || percentage > 100) {
    throw new RangeError('percentage must be between 0 and 100');
  }

  const duration = await getVideoDuration(videoPath);
  const timestamp = duration * (percentage / 100);
  outputFilename = outputFilename + '.webp';

  // Ensure output folder exists
  await mkdir(outputFolder, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename: outputFilename,
        folder: outputFolder,
      })
      .on('end', () => {
        // Return relative path from the current working directory
        const relativePath = path.relative(
          process.cwd(),
          path.join(outputFolder, outputFilename),
        );
        resolve('./' + relativePath.replace(/\\/g, '/'));
      })
      .on('error', (err) => reject(err));
  });
}
