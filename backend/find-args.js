const fs = require('fs');
const Papa = require('papaparse');

function findArgs(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject('Error reading file');
      }

      const results = Papa.parse(data, { header: false });
      const schoolArray = [];
      const teamArray = [];

      for (let i = 1; i < results.data.length; i++) {
        const row = results.data[i];
        if (row.length > 3) { // Ensure there are enough columns
          schoolArray.push(row[0]); // 1st element
          teamArray.push(row[2]); // 3rd element
        }
      }
      resolve({ schools: schoolArray, teams: teamArray });
    });
  });
}

module.exports = findArgs;
