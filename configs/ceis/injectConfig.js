#!/usr/bin/env node
const fs = require('fs/promises');
// in production build, dotenv is installed in `standalone` folder via the Dockerfile
const dotenv = require('dotenv');
const { getRuntimeConfig } = require('./runtimeConfig');

dotenv.config();
const SERVER_FILE_PATH = './server.js';

const { serverRuntimeConfig, publicRuntimeConfig } = getRuntimeConfig();

(async function () {
  try {
    // eslint-disable-next-line no-console
    console.log('📟🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳 Injecting runtime config... 🛠 🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳📟');
    console.log('Replacing publicRuntimeConfig with env variables...');

    // Get standalone server.js file
    const serverContent = await fs.readFile(SERVER_FILE_PATH, { encoding: 'utf8' });

    // Replace hardcoded runtimeConfig
    const publicRegexp = /"publicRuntimeConfig":([^{]*?(?:{[^}]*?}))/ms;
    const serverRegexp = /"serverRuntimeConfig":([^{]*?(?:{[^}]*?}))/ms;

    const publicMatches = serverContent.match(publicRegexp);
    const oldPublicRuntimeConfig = JSON.parse(publicMatches[1]);
    const newPublicRuntimeConfig = {
      ...oldPublicRuntimeConfig,
      ...publicRuntimeConfig,
    };
    console.log('🛠 newPublicRuntimeConfig 🛠', newPublicRuntimeConfig, '🛠 End of newPublicRuntimeConfig 🛠');
    const serverMatches = serverContent.match(serverRegexp);
    const oldServerRuntimeConfig = JSON.parse(serverMatches[1]);
    const newServerRuntimeConfig = {
      ...oldServerRuntimeConfig,
      ...serverRuntimeConfig,
    };
    
    console.log('🔐 newServerRuntimeConfig 🔐', newServerRuntimeConfig, '🔐 End of newServerRuntimeConfig 🔐');
    const newServer = serverContent
      .replace(publicRegexp, `"publicRuntimeConfig":${JSON.stringify(newPublicRuntimeConfig)}`)
      .replace(serverRegexp, `"serverRuntimeConfig":${JSON.stringify(newServerRuntimeConfig)}`);

    // Write to file
    await fs.writeFile(SERVER_FILE_PATH, newServer, 'utf8', function (err) {
      // eslint-disable-next-line no-console
      if (err) return console.log(err);
    });

    // eslint-disable-next-line no-console
    console.log('Done!');
    console.log('🏮🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳 End of Injecting runtime config 🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🔳🏮');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
})();