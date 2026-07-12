require("dotenv").config();

const http = require("http");
const app = require("./app");
const { initSocket } = require("./lib/socket");

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
