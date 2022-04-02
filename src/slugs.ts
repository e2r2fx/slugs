import slugify from 'slugify';
import fs from 'fs';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import randomstring from 'randomstring';
import progress from 'progress-stream';
import { streamValues } from 'stream-json/streamers/StreamValues';
import cliProgress from 'cli-progress';

const stat = fs.statSync('./src/data.json');
const progressStream = progress({ length: stat.size, time: 100 });

const progressBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

// start the progress bar with a total value of 200 and start value of 0
progressBar.start(100, 0);

progressStream.on('progress', (_progress) => {
  progressBar.update(Math.floor(_progress.percentage));
});

const slugifyStream = async (data: { value: string[] }) => {
  return data.value
    .map((productName: string) => {
      // Create slug from product name
      const slug = slugify(productName, { lower: true });
      // Generate id to append to url
      const id = randomstring.generate({
        length: 5,
        capitalization: 'lowercase',
      });
      return `${slug}-${id}`;
    })
    .join(`,\n`);
};

const writeStream = fs.createWriteStream('./output.csv');

chain([
  fs.createReadStream('./src/data.json', {
    flags: 'r',
    encoding: 'utf-8',
  }),
  progressStream,
  parser(),
  streamValues(),
  slugifyStream,
  writeStream,
]);

writeStream.on('finish', () => {
  // stop the progress bar
  progressBar.stop();
});
