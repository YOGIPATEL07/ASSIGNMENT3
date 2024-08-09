// initialize .env
require("dotenv").config();
// Global configuration object that will contain app level variables such as:
// client secrets, API keys, database connection strings, etc.
const globals = {
    ConnectionString: {
        MongoDB: process.env.CONNECTION_STRING_MONGODB,
    },
    Authentication: {
        GitHub: {
         ClientId: "Ov23liCDGABYIurM4ILZ",
            
          ClientSecret: "d6821d5c98f3aac42527c0d56d82244c5fff1fd3",
            
          CallbackUrl: "https://assignment3-ujm8.onrender.com/github/callback"
        },
      },
}
// export the configuration object
module.exports = globals;
