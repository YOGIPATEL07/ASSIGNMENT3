
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const dataSchemaObject = {
  username: { type: String, required: true,  },
  password: { type: String }, 
  oauthId: { type: String},
  oauthProvider: { type: String }, 
  created: { type: Date },
};
const mongooseSchema = mongoose.Schema(dataSchemaObject);
// Inject the passport-local-mongoose plugin into our Schema
mongooseSchema.plugin(plm);
module.exports = mongoose.model("User", mongooseSchema);
