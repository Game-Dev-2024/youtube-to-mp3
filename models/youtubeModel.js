const fs = require('fs');
const path = require('path');
const youtubedl = require('yt-dlp-exec');
const moment = require('moment');
const mongoose = require('mongoose');
const File = require('./File');

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/youtube-to-mp3')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Ensure the downloads directory exists
const downloadsDir = path.resolve(__dirname, '../downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

exports.downloadMp3 = async (videoUrl) => {
  const dateTimeNow = moment().format("YYYYMMDDHHmmssSSS");
  const output = path.join(downloadsDir, `${dateTimeNow}.mp3`);
  console.log(output)
  try {
    console.log('Starting MP3 download process...');

    // Retrieve metadata
    const resultTitle = await youtubedl(videoUrl, { dumpJson: true });
    const [songName, artistFromTitle] = resultTitle.title.split(" - ").map((text) => text.trim());
    const artist = resultTitle.artist || artistFromTitle || "Unknown";

    // Check for existing file in database
    const existingFile = await File.findOne({ originName: songName });
    if (existingFile) {
      console.log('File already exists:', existingFile);
      return {
        originName: songName,
        fileName: existingFile.fileName,
        stream: fs.createReadStream(existingFile.filePath),
      };
    }

    // Download the MP3
    console.log('Downloading file with youtube-dl...');
    await youtubedl(videoUrl, {
      extractAudio: true,
      format: 'bestaudio/best',
      output: output,
      audioFormat: 'mp3',
    });

    // Verify the file exists
    if (!fs.existsSync(output)) {
      console.error('File was not created:', output);
      throw new Error('Failed to create file.');
    }
    console.log('File successfully created at:', output);

    // Generate quote
    const quote = generateQuote(songName, artist);

    // Save file information to database
    const newFile = new File({
      fileImg: resultTitle.thumbnails?.find(ele => ele.resolution === '1920x1080')?.url || "",
      originName: songName,
      artist: artist,
      fileName: `${dateTimeNow}.mp3`,
      filePath: output,
      quote: quote,
    });
    await newFile.save();
    console.log('File saved to database:', newFile);

    return {
      fileImg: newFile.fileImg,
      originName: newFile.originName,
      artist: newFile.artist,
      fileName: newFile.fileName,
      filePath: newFile.filePath,
      quote: newFile.quote,
    };

  } catch (error) {
    console.error('Error in downloadMp3:', error.message);
    throw error;
  }
};

const generateQuote = (songName, artist) => `
♪ 🎼 ♪━━━━━━━━ ♪ ♬
🎧🎶 ${songName} 🎶🎧
╰➤ ${artist}
♪ ♬ ━━━━━━━━━ 🎵 ♪
`;
