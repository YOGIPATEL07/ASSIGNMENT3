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
          ClientId: "Ov23ctqw3kb1D0x0Ibwp",
          ClientSecret: "37b959a56c86755478041d490c4184636feda578",
          CallbackUrl: "http://localhost:3000/github/callback"
        },
      },
}
// export the configuration object
module.exports = globals;