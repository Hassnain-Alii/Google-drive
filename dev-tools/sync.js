const chokidar = require("chokidar");
const formData = require("form-data");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
// const https = require("https");
require("dotenv").config();

const WATCH_DIR = "./tests";
const UPLOAD_URL = "http://localhost:4000/upload";
const TOKEN = process.env.TOKEN || "";

require("fs").mkdirSync(WATCH_DIR, { recursive: true });

console.log(`[DAEMON] Watching ${path.resolve(WATCH_DIR)} ...`);

chokidar
  .watch(WATCH_DIR, { ignored: /(^|[\/\\])\../, persistent: true })
  .on("add", (filePath) => {
    console.log(`[DAEMON] New file ->`, filePath);
    const form = new formData();
    form.append("file", fs.createReadStream(filePath));

    axios({
      method: "POST",
      url: UPLOAD_URL,
      headers: form.getHeaders(),
      data: form,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      // httpAgent: new https.Agent({ rejectUnauthorized: false }),
    })
      .then((res) => console.log(`[DAEMON] Upload id =`, res.data.fileId))
      .catch((err) => {
        console.log(`[DAEMON] Upload error:`, err.message);
        if (err.response)
          console.log(`[DAEMON] Server replied:`, err.response.data);
      });
  });
