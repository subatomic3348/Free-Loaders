const express = require("express");
const cors = require("cors");
const { downloadVideo } = require("./downloader");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const result = await downloadVideo(url);
        
        if (result.usePuppeteer) {
           
            return res.redirect(result.videoSrc);
        } else {
            
            const filename = `video-${Date.now()}.mp4`;
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            
            result.stream.on('end', () => {
                console.log('Stream ended');
                res.end();
            });
            
            result.stream.on('error', (error) => {
                console.error('Stream error:', error);
                res.status(500).send('Stream error occurred');
            });

           
            result.stream.pipe(res);
        }
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: "Failed to download video" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));