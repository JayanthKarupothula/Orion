/**
 * @description- this file is used to start the dmn simulator backend jar
 * when we do npm run dev , the concurrently package is used to start the dmn simulator backend and the orion application server
 * the dev script in package.json is modified to start the dmn simulator backend
 * make sure you have java installed in your system with version greater than 8 eg 11 or 17
 * for lower versions --add-opens flag is not supported
 */
const path = require('path');
module.exports = {
  apps: [
    {
      name: "DmnSimulatorBackend",
      script: "java",
      args: [
        "--add-opens",
        "java.base/java.lang=ALL-UNNAMED",
        "-Dserver.port=9000",
        "-jar",
        path.join(path.dirname(__dirname), "../server/camunda-dmn-simulator.jar")
      ],
      node_args: [],
      log_date_format: "MM-DD-YYYY HH:mm Z",
      exec_interpreter: "none",
      exec_mode: "fork"
    }
  ],
};