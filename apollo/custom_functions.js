const models = require("../models");

const getReceipts = () => async parent => {
  let receipts = [];

  if (parent.receipt_ids) {
    Promise.all(
      (receipts = parent.receipt_ids.map(async receipt_id => {
        const user = await models.Users.findOne({
          "receipts._id": receipt_id
        });
        const receipt = user.receipts.filter(
          r => String(r._id) === String(receipt_id)
        )[0];
        return receipt;
      }))
    );
  }

  return receipts;
};

module.exports = {
  getReceipts
};
