#!/usr/bin/env nodejs

const program = require('commander');
const crypto = require('crypto');
const axios = require('axios');
const colors = require('colors');
const fs = require('fs');
const readline = require('readline');
const os = require('os');
const path = require('path');

const rcFile = path.join(os.homedir(), '.tltrc');

function updateConfig() {
    writeConfig((cfg) => {
        console.log(colors.green('Update configration success!'));
        process.exit(0);
    });
}

function writeConfig(cb) {
    readline.clearLine();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('APPId: ', (appId) => {
        rl.question('APP Secret: ', (appSecret) => {
            const cfg = { appId, appSecret };
            rl.close();
            fs.writeFileSync(rcFile, JSON.stringify(cfg));
            return cb(cfg);
        });
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
    program.version('0.0.1')
        .option('-C, --config', 'config keys')
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp((txt) => {
            return colors.red(txt);
        });
        process.exit(-1);
    }

    if (program.config) {
        updateConfig();
    } else {
        checkConfig((cfg) => {
            const APPID = cfg.appId;
            const APPSecret = cfg.appSecret;
            const SALT = Math.floor(Math.random() * 1000);
            const q = process.argv[2].toString('utf-8'),
                from = 'auto',
                to = 'auto',
                sign = crypto.createHash('md5').update(APPID + q + SALT + APPSecret).digest('hex');

            axios.post(encodeURI(`https://fanyi-api.baidu.com/api/trans/vip/translate?q=${q}&from=${from}&to=${to}&appid=${APPID}&salt=${SALT}&sign=${sign}`))
                .then(res => {
                    const transResultArray = res.data.trans_result;
                    if (res.data.error_code) {
                        console.log(res.data);
                        process.exit(-1);
                    }

                    if (Array.isArray(transResultArray)) {
                        transResultArray.forEach((item) => {
                            console.log(colors.yellow(item.src) + ': ' + colors.green(item.dst));
                        });
                    }
                })
                .catch(err => {
                    console.log('error occured!');
                    console.log(err);
                });
        });
    }
}

init();