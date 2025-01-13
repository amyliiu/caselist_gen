// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer'); 
const login = require('./login');
const findArgs = require('./find-args');
const { scrapeData } = require('./scraper');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors());
app.use(express.json()); 

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
    const { schools, teams } = await findArgs(filePath);
    // console.log('Team codes and schools generated successfully');

    const scrapedData = [];
    //TODO: change length
    for(let i = 0; i < 2; i++) {
      const team = teams[i]
      const school = schools[i];
      console.log('Scraping data for team:', team);

      const data = await scrapeData(team, school);
      if(data) {
        scrapedData.push(data);
        console.log('Scraped data:', data);
      }
      else{
        console.log('Error scraping data for team:', team);
      }
    }

    // const workbook = XLSX.utils.book_new();
    // const worksheet = XLSX.utils.json_to_sheet(scrapedData);
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Scraped Data');

    // const outputPath = path.join(__dirname, 'caselist.xlsx');
    // XLSX.writeFile(workbook, outputPath);

    // console.log('Scraped data saved to:', outputPath);
    
    res.json({ data: scrapedData });
    
  } catch (error) {
      console.log('Error generating team codes: ', error);
      res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});