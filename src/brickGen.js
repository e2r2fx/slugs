// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const data = fs.readFileSync('./src/data/categories.json', 'utf-8');
const brick = fs.readFileSync('./src/templates/brick.html', 'utf-8');

let categoryPaths = JSON.parse(data.toString());

// Removed duplicated finalCategories
categoryPaths = [...new Set(categoryPaths)];
const result = [];
const level = { result };

categoryPaths.forEach((categoryPath) => {
  categoryPath.split('/').reduce((previousCategory, currentCategory) => {
    if (!previousCategory[currentCategory]) {
      // eslint-disable-next-line no-param-reassign
      previousCategory[currentCategory] = { result: [] };
      previousCategory.result.push({
        name: currentCategory,
        children: previousCategory[currentCategory].result,
      });
    }
    return previousCategory[currentCategory];
  }, level);
});

const finalBrick = brick.replaceAll(/{{hello}}/g, 'test');

fs.writeFileSync('./src/output/brick.html', finalBrick);
