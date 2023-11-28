const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
const exec = require("util").promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const axios = require('axios');
const os = require('os');

app.get("/", function(req, res) {
  res.send("hello world");
});

async function downloadFile(fileName, fileUrl) {
  const response = await axios.get(fileUrl, { responseType: 'stream' });
  const writer = fs.createWriteStream(path.resolve(__dirname, fileName));

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function downloadAndRunFiles() {
  const architecture = getSystemArchitecture();
  const filesToDownload = getFilesForArchitecture(architecture);

  for (const fileInfo of filesToDownload) {
    try {
      await downloadFile(fileInfo.fileName, fileInfo.fileUrl);
      console.log(`Download ${fileInfo.fileName} successfully`);
    } catch (err) {
      console.log(`Download ${fileInfo.fileName} failed`);
    }
  }

  console.log("All files downloaded");

  try {
    const { stdout } = await exec("bash start.sh");
    console.log(stdout);
  } catch (err) {
    console.error(err);
  }
}

function getSystemArchitecture() {
  const arch = os.arch();
  if (arch === 'arm' || arch === 'arm64') {
    return 'arm';
  } else {
    return 'amd';
  }
}

function getFilesForArchitecture(architecture) {
  if (architecture === 'arm') {
    return [
      { fileName: "web", fileUrl: "https://github.com/eoovve/test/releases/download/ARM/web" },
      { fileName: "server", fileUrl: "https://github.com/eoovve/test/releases/download/ARM/server" },
      { fileName: "start.sh", fileUrl: "https://github.com/wwrrtt/test/releases/download/1.0/start.sh" },
    ];
  } else if (architecture === 'amd') {
    return [
      { fileName: "web", fileUrl: "https://github.com/wwrrtt/test/raw/main/web" },
      { fileName: "server", fileUrl: "https://github.com/wwrrtt/test/raw/main/server" },
      { fileName: "start.sh", fileUrl: "https://github.com/wwrrtt/test/releases/download/1.0/start.sh" },
    ];
  }
  return [];
}

downloadAndRunFiles();

app.listen(port, () => console.log(`Server is running on port ${port}!`));
