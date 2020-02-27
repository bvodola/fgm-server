const Excel = require("exceljs");

const createSheet = async (data = []) => {
  // Ensuring that data is an array
  if (!Array.isArray(data)) data = [];

  // Create Workbook
  let workbook = new Excel.Workbook();
  workbook.created = new Date();

  // Create Worksheet
  let sheet = workbook.addWorksheet("Relatório");

  // Adding Rows
  data.forEach(row => {
    sheet.addRow(row);
  });

  return new Promise((resolve, reject) => {
    try {
      // Write to file
      workbook.xlsx.writeBuffer().then(function(buffer) {
        resolve(buffer);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  createSheet
};
