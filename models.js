const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const env = require("./env");

// ===============
// Database Config
// ===============
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const mongoosePromise = mongoose.connect(env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoosePromise.catch(reason => {
  console.log(reason);
});

// =======
// Schemas
// =======
const usersSchema = new Schema(
  {
    email: { type: String, unique: true },
    password: String,
    name: String,
    cro: String,
    cpf: String,
    rg_cnpj: String,
    phone: String,
    receipts: [
      {
        dental_name: String,
        approved: { type: Boolean, default: false },
        code: String,
        amount: String,
        files: [String]
      }
    ],
    created: { type: Date, default: Date.now }
  },
  { strict: false }
);

usersSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

usersSchema.methods.validPassword = function(password) {
  return (
    bcrypt.compareSync(password, this.password) || password === this.password
  );
};

const drawsSchema = new Schema(
  {
    receipt_id: Schema.ObjectId,
    winner_ids: [Schema.ObjectId],
    prize: String,
    published: Boolean,
    date_scheduled: Date,
    date_performed: Date,
    created: { type: Date, default: Date.now }
  },
  { strict: false }
);

let models = {};
models.Users = mongoose.model("users", usersSchema);
models.Draws = mongoose.model("draws", drawsSchema);

module.exports = models;
