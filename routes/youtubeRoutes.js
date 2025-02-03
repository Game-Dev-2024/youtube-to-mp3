const express = require('express');
const youtubeController = require('../controllers/youtubeController');

const router = express.Router();

// Render the main page
router.get('/', youtubeController.getHomePage);
// Get the list of MP3 files from the database
router.get('/mp3-list', youtubeController.getMp3List);
// Handle the download request
router.post('/download', youtubeController.downloadMp3);
router.delete('/delete/:_id', youtubeController.deleteMp3);
module.exports = router;
