const fs = require('fs');
const puppeteer = require('puppeteer');
const crypto = require('crypto');

const readmePath = 'README.md';
const outputDir = 'screenshots';

(async () => {
  const readme = fs.readFileSync(readmePath, 'utf8');

  const urlRegex = /(https:\/\/lost\.university\/[^\s)]+)/g;
  const urls = [...new Set(readme.match(urlRegex))];

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  let newReadme = readme;

  for (const url of urls) {
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
    const fileName = `${outputDir}/${hash}.png`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    await page.setViewport({ width: 3440, height: 1440 });
    await page.screenshot({ path: fileName });

    const markdownImg = `![${hash}](${fileName})`;
    newReadme = newReadme.replace(url, `[${markdownImg}](${url})`);
  }

  await browser.close();
  fs.writeFileSync(readmePath, newReadme);
})();
