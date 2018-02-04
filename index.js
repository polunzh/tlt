#!/usr/bin/env node

const program = require('commander');
const crypto = require('crypto');
const axios = require('axios');
const colors = require('colors');
const fs = require('fs');
const readline = require('readline');
const os = require('os');
const path = require('path');

const historyFile = path.join(os.homedir(), '.tlthistoryrc');
const rcFile = path.join(os.homedir(), '.tltrc');

function writeConfig(cb) {
  readline.clearLine();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('APPId: ', appId => {
    rl.question('APP Secret: ', appSecret => {
      const cfg = { appId, appSecret };
      rl.close();
      fs.writeFileSync(rcFile, JSON.stringify(cfg));
      return cb(cfg);
    });
  });
}

function updateHistory(word) {
  let historyWordMap;
  if (!fs.existsSync(historyFile)) {
    historyWordMap = new Map();
  } else {
    historyWordMap = JSON.parse(fs.readFileSync(historyFile));
  }

  if (historyWordMap[word]) {
    historyWordMap[word] += 1;
  } else {
    historyWordMap[word] = 1;
  }

  fs.writeFileSync(historyFile, JSON.stringify(historyWordMap));
}

function readHistory() {
  if (!fs.existsSync(historyFile)) {
    return [];
  }

  const historyWordMap = JSON.parse(fs.readFileSync(historyFile));
  if (historyWordMap) {
    const keys = Object.keys(historyWordMap);
    const words = [];
    for (const word of keys) {
      words.push({ word, value: historyWordMap[word] });
    }

    return words.sort((x, y) => x.value < y.value);
  }

  return [];
}

function readSpecificWordHistory(word) {
  const historyWordMap = JSON.parse(fs.readFileSync(historyFile));
  if (historyWordMap && historyWordMap[word]) {
    return historyWordMap[word];
  }

  return 0;
}

function printHistory(words, pageSize = 20) {
  if (Array.isArray(words)) {
    if (words.length === 0) {
      console.log(`${os.EOL} 暂无查询历时`);
    }

    for (let i = 0; i < words.length; i++) {
      let printWidth = 8 - words[i].word.length;
      printWidth = printWidth < 0 ? 0 : printWidth;
      console.log(`${colors.yellow(i + 1)} => ${words[i].word} ${' '.repeat(printWidth)} ${words[i].value}`);

      if (i > pageSize - 2) {
        break;
      }
    }
  }
}

function updateConfig() {
  writeConfig(() => {
    console.log(colors.green('Update configration success!'));
    process.exit(0);
  });
}

function checkConfig(cb) {
  if (fs.existsSync(rcFile)) {
    const cfg = fs.readFileSync(rcFile);
    return cb(JSON.parse(cfg));
  }

  writeConfig(cb);
}

function init() {
  program
    .version('0.0.1')
    .option('-C, --config', 'config keys')
    .option('--history [type]', 'query history')
    .parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp(txt => colors.red(txt));
    process.exit(-1);
  }

  if (program.history) {
    printHistory(readHistory());
    return;
  }

  if (program.config) {
    updateConfig();
  } else {
    checkConfig(cfg => {
      const APPID = cfg.appId;
      const APPSecret = cfg.appSecret;
      const SALT = Math.floor(Math.random() * 1000);
      const q = process.argv[2].toString('utf-8');
      const from = 'auto';
      const to = 'auto';
      const sign = crypto
        .createHash('md5')
        .update(APPID + q + SALT + APPSecret)
        .digest('hex');

      axios
        .post(encodeURI(`https://fanyi-api.baidu.com/api/trans/vip/translate?q=${q}&from=${from}&to=${to}&appid=${APPID}&salt=${SALT}&sign=${sign}`))
        .then(res => {
          const transResultArray = res.data.trans_result;
          if (res.data.error_code) {
            console.log(res.data);
            process.exit(-1);
          }

          if (Array.isArray(transResultArray)) {
            transResultArray.forEach(item => {
              console.log(`${os.EOL}> ${colors.yellow(item.src)}: ${colors.green(item.dst)}`);
            });
          }

          updateHistory(q);
          console.log(`${os.EOL}=> 第${colors.blue(readSpecificWordHistory(q))}次查询`);
        })
        .catch(err => {
          console.log('error occured!');
          console.log(err);
        });
    });
  }
}

init();
