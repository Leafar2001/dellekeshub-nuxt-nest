import { destructVideoPath } from './path-utils';

it('test video path with season', () => {
  const path =
    './videos/videos1/Over The Garden Wall/Season 01/Over The Garden Wall S01E01 - The Old Grist Mill.mp4';

  const res = destructVideoPath(path);

  expect(res).toBeDefined();

  const {
    videoName,
    collectionName,
    collectionPath,
    seasonNumber,
    seasonName,
  } = res!;

  expect(videoName).toBe('Over The Garden Wall S01E01 - The Old Grist Mill');
  expect(collectionName).toBe('Over The Garden Wall');
  expect(collectionPath).toBe('./videos/videos1/Over The Garden Wall');
  expect(seasonNumber).toBe(1);
  expect(seasonName).toBe('Season 01');
});

it('test video path without season', () => {
  const path =
    './videos/videos1/The Good, The Bad And The Ugly/The Good, The Bad And The Ugly.mp4';

  const res = destructVideoPath(path);

  expect(res).toBeDefined();

  const {
    videoName,
    collectionName,
    collectionPath,
    seasonNumber,
    seasonName,
  } = res!;

  expect(videoName).toBe('The Good, The Bad And The Ugly');
  expect(collectionName).toBe('The Good, The Bad And The Ugly');
  expect(collectionPath).toBe(
    './videos/videos1/The Good, The Bad And The Ugly',
  );
  expect(seasonNumber).toBeUndefined();
  expect(seasonName).toBeUndefined();
});
