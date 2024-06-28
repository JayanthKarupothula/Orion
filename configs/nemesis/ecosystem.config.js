module.exports = {
  apps: [
    {
      name: "orion",
      script: "./server.js",
    },
    {
      name: "DmnSimulatorBackend",
      script: "java",
      args: [
          "--add-opens",
          "java.base/java.lang=ALL-UNNAMED",
          "-Dserver.port=9000",
          "-jar",
          "./camunda-dmn-simulator.jar"
      ],
      node_args: [],
      log_date_format: "MM-DD-YYYY HH:mm Z",
      exec_interpreter: "none",
      exec_mode: "fork"
   },
  ],
};
