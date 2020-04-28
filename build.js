const fs = require('fs');
const sh = require('shelljs');

const name = process.argv[2];

if (!name) {
  console.log('node ./build.js gm-fetch');
  return;
}

if (!fs.existsSync(`./node_modules/${name}`)) {
  console.log(`${name} 不存在`);
  return;
}

if (!fs.existsSync(`./node_modules/${name}/package.json`)) {
  console.log(`${name} 不存在 package.json 文件`);
  return;
}

const {version} = require(`./node_modules/${name}/package.json`);

if (!fs.existsSync(name)) {
  fs.mkdirSync(name);
}

if (!fs.existsSync(`./${name}/${version}`)) {
  fs.mkdirSync(`./${name}/${version}`);
}

sh.exec(`cp -rf ./node_modules/${name}/* ./${name}/${version}/`);

console.log(`${name} ${version} Done!`);
