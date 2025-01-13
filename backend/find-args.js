const fs = require('fs');
const Papa = require('papaparse');

function findArgs(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject('Error reading file');
      }

      const results = Papa.parse(data, { header: false });
      const schoolsArray = [];
      const teamsArray = [];
      for (let i = 1; i < results.data.length; i++) {
        const row = results.data[i];
        if (row.length > 3) { 
          schoolsArray.push(row[0]);
          teamsArray.push(row[2]);
        }
      }

      resolve({ schools: schoolsArray, teams: teamsArray });
    });
  });
}

module.exports = findArgs;
