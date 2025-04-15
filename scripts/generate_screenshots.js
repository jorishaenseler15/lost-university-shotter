const fs = require('fs');
const puppeteer = require('puppeteer');
const crypto = require('crypto');

const tmplReadmePath = 'README.tmpl.md'; // Input file with links
const readmePath = 'README.md'; // Output file
const outputDir = 'screenshots';

(async () => {
  // Read the template README file
  const tmplReadme = fs.readFileSync(tmplReadmePath, 'utf8');

  // Regular expression to match URLs (you can adjust the pattern if needed)
  const urlRegex = /(https:\/\/lost\.university\/[^\s)]+)/g;
  const urls = [...new Set(tmplReadme.match(urlRegex))];

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // Launch Puppeteer browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Initialize a new variable for the updated README content
  let newReadme = tmplReadme;

  // Process each URL to take a screenshot and replace it in the new README content
  for (const url of urls) {
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
    const fileName = `${outputDir}/${hash}.png`;

    // Navigate to the URL and take a screenshot
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    await page.setViewport({ width: 2200, height: 900 });
    await page.screenshot({ path: fileName });

    // Generate the markdown image syntax
    const markdownImg = `![${hash}](${fileName})`;

    // Replace the original URL with the markdown image syntax
    newReadme = newReadme.replace(url, `[${markdownImg}](${url})`);
  }

  // Close the Puppeteer browser
  await browser.close();

  // Write the modified content to the final README file
  fs.writeFileSync(readmePath, newReadme);
})();
