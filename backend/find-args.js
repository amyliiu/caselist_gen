const fs = require('fs');
const Papa = require('papaparse');

function findArgs(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject('Error reading file');
      }

      const results = Papa.parse(data, { header: false });
      const codeArray = [];
      const schoolArray = [];
      for (let i = 1; i < results.data.length; i++) {
        const row = results.data[i];
        if (row.length > 3) {
          codeArray.push(row[3]); 
          schoolArray.push(row[0]);
        }
      }

      resolve({ codes: codeArray, schools: schoolArray });
    });
  });
}

module.exports = findArgs;
