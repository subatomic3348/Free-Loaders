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
        const filePath = await downloadVideo(url);
        res.download(filePath); 
    } catch (error) {
        res.status(500).json({ error: "Failed to download video" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
