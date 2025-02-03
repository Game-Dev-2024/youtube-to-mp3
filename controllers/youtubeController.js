const youtubeModel = require('../models/youtubeModel');

const File = require('../models/File');  // Assuming you have a 'File' model to fetch from the database
exports.getHomePage = async(req, res) => {
    const mp3Files = await File.find({}).sort({ dateTime: -1 });
    res.render('index', {mp3Files, error: null });
  };
  
  exports.getMp3List = async (req, res) => {
    try {
      // Fetch all MP3 file records from the database
      const mp3Files = await File.find({}).sort({ dateTime: -1 });  // Sorting by dateTime to show the latest first
  
      // Render the homepage with the list of MP3 files
      res.render('index', { mp3Files, error: null });
    } catch (error) {
      console.error('Error occurred:', error);
      res.render('index', { error: 'Failed to retrieve MP3 files. Please try again.' });
    }
  };

exports.downloadMp3 = async (req, res) => {
  const videoUrl = req.body.url.includes("&") 
  ? req.body.url.split("&")[0] 
  : req.body.url;

    var mp3Files = await File.find({}).sort({ dateTime: -1 });
    if (!videoUrl) {
      return res.render('index', { error: 'Please provide a valid YouTube URL.' });
    }
  
    try {
      const mp3Details = await youtubeModel.downloadMp3(videoUrl);
      //   mp3Files = await File.find({}).sort({ dateTime: -1 });
        res.redirect("/")
    } catch (error) {
      console.error('Error occurred:', error);
      res.render('index', {mp3Files, error: 'Failed to download the video. Please try again. ' + error.message });
    }
  };
  
  const fs = require('fs');
  const path = require('path');
  
  exports.deleteMp3 = async (req, res) => {
    try {
      const { _id } = req.params; // Get the ID of the file to delete from the route parameters
      const id =_id;
      console.log("Deleting . . . . . . . .",id)
      if (!id) {
        return res.render('index', { error: 'Invalid file ID.', mp3Files: await File.find({}).sort({ dateTime: -1 }) });
      }
  
      // Find the file by ID
      const fileToDelete = await File.findById(id);
  
      if (!fileToDelete) {
        return res.render('index', { error: 'File not found.', mp3Files: await File.find({}).sort({ dateTime: -1 }) });
      }
  
      // Extract the file path from the database record
      const filePath = fileToDelete.filePath; // Assuming 'filePath' contains the full path to the file
      console.log(filePath)
      // Delete the file from the file system
      if (filePath) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file from filesystem:', err);
          } else {
            console.log('File successfully deleted from filesystem:', filePath);
          }
        });
      }
  
      // Delete the record from the database
      await File.findByIdAndDelete(id);
  
      // Fetch the updated list of MP3 files after deletion
      const mp3Files = await File.find({}).sort({ dateTime: -1 });
  
      res.redirect("/")
    } catch (error) {
      console.error('Error occurred while deleting the file:', error);
      res.render('index', { error: 'Failed to delete the file. Please try again.', mp3Files: await File.find({}).sort({ dateTime: -1 }) });
    }
  };
  
  
    //   console.log(mp3Details)
    //   res.setHeader('Content-Disposition', `attachment; filename="${mp3Details.fileName}"`);
    //   mp3Details.stream.pipe(res); // ส่งไฟล์ .webm ไปยัง client