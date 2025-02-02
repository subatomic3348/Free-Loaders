const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const downloadVideo = async (url) => {
    return new Promise((resolve, reject) => {
        
        const ytDlp = spawn('yt-dlp', [
            '-f', 'b',  
            '-o', '-',  
            url
        ]);
s
        ytDlp.on('error', (err) => {
            console.log("yt-dlp failed, trying Puppeteer...");
            usePuppeteer();
        });

        
        ytDlp.on('exit', (code) => {
            if (code !== 0) {
                console.log("yt-dlp failed with code " + code + ", trying Puppeteer...");
                usePuppeteer();
            }
        });

        
        ytDlp.stderr.on('data', (data) => {
            console.log('yt-dlp stderr:', data.toString());
        });

        
        if (ytDlp.stdout) {
            resolve({ stream: ytDlp.stdout, usePuppeteer: false });
        }

        async function usePuppeteer() {
            try {
                const browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = await browser.newPage();
                
                try {
                    await page.goto(url, { 
                        waitUntil: "networkidle2",
                        timeout: 30000
                    });
                } catch (error) {
                    await browser.close();
                    return reject("Failed to load page: " + error.message);
                }

                const videoSrc = await page.evaluate(() => {
                    const video = document.querySelector("video");
                    return video ? video.src : null;
                });

                await browser.close();
                
                if (!videoSrc) {
                    return reject("No video found on page");
                }

                resolve({ videoSrc, usePuppeteer: true });
            } catch (puppeteerError) {
                reject("Puppeteer error: " + puppeteerError.message);
            }
        }
    });
};

module.exports = { downloadVideo };