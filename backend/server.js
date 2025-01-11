// backend/server.js
require('dotenv').config();
const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); 
const login = require('./login');
const findArgs = require('./find-args');

const app = express();
const PORT = process.env.PORT || 5001;

// app.use(cors());
// app.use(bodyParser.json());
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Optional: to parse URL-encoded bodies

app.use(cors({
  origin: 'http://localhost:5173',
}));
// TODO: frontend URL

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const isValidLogin = await login(username, password);
    if (isValidLogin) {
      res.json({ message: 'Login successful with username: ' + username + ' and password: ' + password });
      console.log('Login successful with username: ' + username + ' and password: ' + password);
    } else {
      console.log('Invalid username or password.');
      res.status(401).json({ error: 'Invalid username or password.' });
    }
  } catch (error) {
    console.log('Failed to validate login.');
    res.status(500).json({ error: 'Failed to validate login.' });
  }
});

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const { schools, teams } = await findArgs(filePath)
      console.log('Schools and teams generated successfully');
      res.json({message: 'Schools and teams generated successfully'});
  } catch (error) {
      console.log('Error generating schools and teams');
      res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});