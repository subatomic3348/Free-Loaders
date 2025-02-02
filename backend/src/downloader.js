const { exec } = require("child_process");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const DOWNLOAD_DIR = path.join(__dirname, "../downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

const downloadVideo = async (url) => {
    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    return new Promise((resolve, reject) => {
        
        exec(`yt-dlp -f best -o "${filePath}" "${url}"`, async (err) => {
            if (!err) return resolve(filePath);

            console.log("yt-dlp failed, trying Puppeteer...");
            try {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(url, { waitUntil: "networkidle2" });

                const videoSrc = await page.evaluate(() => {
                    const video = document.querySelector("video");
                    return video ? video.src : null;
                });

                await browser.close();

                if (!videoSrc) return reject("No video found");

                exec(`ffmpeg -i "${videoSrc}" -c copy "${filePath}"`, (ffmpegErr) => {
                    if (ffmpegErr) return reject("FFmpeg failed");
                    resolve(filePath);
                });
            } catch (puppeteerError) {
                reject("Puppeteer failed");
            }
        });
    });
};

module.exports = { downloadVideo };
