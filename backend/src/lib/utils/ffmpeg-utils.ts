import ffmpeg from 'fluent-ffmpeg';
import { mkdir } from 'fs/promises';
import path from 'node:path';
import * as z from 'zod/v4';

const VideoMetadataSchema = z.object({
  duration: z.number(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
});

export type VideoMetadata = z.infer<typeof VideoMetadataSchema>;

/**
 * Gets the duration of a video file in seconds.
 * @param videoPath - Absolute or relative path to the video file
 * @returns Promise resolving to duration in seconds
 */
export async function getVideoMetadata(
  videoPath: string,
): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err instanceof Error ? err : new Error(String(err)));

      const videoMetadata = VideoMetadataSchema.parse({
        duration: metadata.format?.duration,
        width: metadata.streams[0].width,
        height: metadata.streams[0].height,
        size: metadata.format?.size,
      });

      resolve(videoMetadata);
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
): Promise<{
  path: string;
  timestamp: number;
  width: number;
  height: number;
  extension: string;
}> {
  if (percentage < 0 || percentage > 100) {
    throw new RangeError('percentage must be between 0 and 100');
  }

  const duration = (await getVideoMetadata(videoPath)).duration;
  const timestamp = duration * (percentage / 100);
  outputFilename = outputFilename + '.webp';

  // Ensure output folder exists
  await mkdir(outputFolder, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf',
        'crop=' +
          'if(gt(a,3/2),ih*3/2,iw):' +
          'if(gt(a,3/2),ih,iw*2/3),' +
          'scale=1500:1000',
      ])
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
        resolve({
          path: './' + relativePath.replace(/\\/g, '/'),
          timestamp,
          extension: path.extname(outputFilename),
          width: 1500,
          height: 1000,
        });
      })
      .on('error', (err) => reject(err));
  });
}
