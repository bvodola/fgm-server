const models = require("../models");

const getReceipt = () => async parent => {
  if (parent.receipt_id) {
    const user = await models.Users.findOne({
      "receipts._id": parent.receipt_id
    });
    const receipt = user.receipts.filter(
      r => String(r._id) === String(parent.receipt_id)
    )[0];
    return receipt;
  }

  return null;
};

module.exports = {
  getReceipt
};
