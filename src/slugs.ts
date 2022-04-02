import slugify from 'slugify';
import fs from 'fs';
import randomstring from 'randomstring';
import data from './data.json';

const slugs = data
  .map((productName) => {
    const slug = slugify(productName, { lower: true });
    const id = randomstring.generate({
      length: 5,
      capitalization: 'lowercase',
    });
    return `${slug}-${id}`;
  })
  .join(`,\n`);

fs.writeFileSync('./output.csv', slugs);
