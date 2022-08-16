const fs = require('node:fs');
const util = require('node:util');

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

const chromeLauncher = require('chrome-launcher');
const reportGenerator = require('lighthouse/report/generator/report-generator');
const request = require('request');
const { argv } = require('yargs');

const { type } = argv;

const apps = {
  string: {
    name: 'react-17-server-render-string',
    port: 2998
  },
  stream: {
    name: 'react-18-server-render-stream',
    port: 2999
  }
};

const currentApp = apps[type];

const dir = 'report';

const options = {
  logLevel: 'info',
  disableDeviceEmulation: true,
  chromeFlags: ['--disable-mobile-emulation']
};

// eslint-disable-next-line no-shadow
async function lighthouseFromPuppeteer(url, options, config = null) {
  // Launch chrome using chrome-launcher
  const chrome = await chromeLauncher.launch(options);
  options.port = chrome.port;

  // Connect chrome-launcher to puppeteer
  const resp = await util.promisify(request)(`http://localhost:${options.port}/json/version`);
  const { webSocketDebuggerUrl } = JSON.parse(resp.body);
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

  // Run Lighthouse
  const { lhr } = await lighthouse(url, options, config);
  await browser.disconnect();
  await chrome.kill();

  const html = reportGenerator.generateReport(lhr, 'html');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFile(`${dir}/${currentApp.name}.html`, html, (err) => {
    if (err) throw err;
  });
}

lighthouseFromPuppeteer(`http://localhost:${currentApp.port}`, options);
