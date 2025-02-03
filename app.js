const express = require('express');
const bodyParser = require('body-parser');
const youtubeRoutes = require('./routes/youtubeRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/downloads', express.static('downloads'));
app.set('view engine', 'ejs');

// Routes
app.use('/', youtubeRoutes);
// Get the list of MP3 files from the database

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
