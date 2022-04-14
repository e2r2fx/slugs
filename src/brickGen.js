// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const data = fs.readFileSync('./src/data/categories.json', 'utf-8');
const brickTemplate = fs.readFileSync('./src/templates/brick.html', 'utf-8');

let categoryPaths = JSON.parse(data.toString());

// Removed duplicated finalCategories
categoryPaths = [...new Set(categoryPaths)];
const categoryTree = [];
const level = { categoryTree };

categoryPaths.forEach((categoryPath) => {
  const categoryPathArray = categoryPath.split('/');
  categoryPathArray.reduce((acc, currentCategory, currentIndex) => {
    if (!acc[currentCategory]) {
      // eslint-disable-next-line no-param-reassign
      acc[currentCategory] = { categoryTree: [] };

      // generate category url
      const url = categoryPathArray
        .slice(0, currentIndex + 1)
        .join('/')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/(default-category\/)/g, '');

      acc.categoryTree.push({
        title: currentCategory,
        level: currentIndex,
        url,
        children: acc[currentCategory].categoryTree,
      });
    }
    return acc[currentCategory];
  }, level);
});

const generateTemplate = (category, accumulatedTemplate = '') => {
  let template = '';
  switch (category.level) {
    case 0:
      template = accumulatedTemplate;
      break;
    case 1:
      template = `
<div class='menu-item has-submenu'>
<div class='menu-title'><a>${category.title}</a></div>
  ${
    category.children.length > 0
      ? `
  <div class='menu-content-wrap'>
    <div class='menu-content'>
      {{category2}}
    </div>
    <div class='menu-bottom-content'>
        <div class='menu-bottom-item'><a href="{{store url='${category.url}'}}">Shop All ${category.title}</a></div>
      </div>
  </div>`
      : ''
  }
</div>`;
      break;
    case 2:
      template = `
<div class='menu-content-item has-modile-submenu'>
  <div class='menu-content-item-header'>${category.title}</div>
    ${
      category.children.length > 0
        ? `
    <div class='menu-content-item-submenu'>
      <div class='submenu-item'>
        <ol>
          {{category3}}
        </ol>
      </div>
    </div>`
        : ''
    }
</div>`;
      break;
    case 3:
      template = `
<li><a href="{{store url='${category.url}'}}">${category.title}</a>
  ${category.children.length > 0 ? `<ol>{{category4}}</ol>` : ''} 
</li>`;
      break;
    case 4:
      template = `
<li><a href="{{store url='${category.url}'}}">${category.title}</a></li>`;
      break;
    default:
      break;
  }

  template = accumulatedTemplate.replace(
    `{{category${category.level}}}`,
    `${template}{{category${category.level}}}`
  );

  if (category.children.length > 0) {
    category.children.forEach((child) => {
      template = `${generateTemplate(child, template)}`;
    });
    template.replace(`{{category${category.level}}}`, '');
  }

  return template.replace(`{{category${category.level + 1}}}`, '');
};

const finalBrick = generateTemplate(categoryTree[0], brickTemplate);

fs.writeFileSync('./src/output/brick.html', finalBrick);
