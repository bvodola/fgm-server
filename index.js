const express = require("express");
const http = require("http");
const https = require("https");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("cookie-session");
const apolloServer = require("./apollo/types");
const cloudinary = require("./cloudinary");
const aws = require("./aws");
const env = require("./env");

// ==============
// Initial Config
// ==============
const app = express();
const port = env.PORT || 3000;
const server = http.createServer(app);
apolloServer.applyMiddleware({ app });
app.use("/graphql", () => {});

// =====================
// Keep Heroku App awake
// =====================
setInterval(function() {
  https.get(env.BACKEND_URL);
}, 300000);

app.get(
  "/.well-known/acme-challenge/yeq1fgoR8_q2LIkpxywczJfhs4hrrZ-SBXEFxS-0Ut",
  (req, res) => {
    res.send(
      "yeq1fgoR8_q2LIkpxywczJfhs4hrrZ-SBXEFxS-0Utc.VlMu2ztew0N4NQpSdZTrF_Sm8-4jKyr2vUWPkKGwTCY"
    );
  }
);

// ========================
// Redir from HTTP to HTTPS
// ========================
var redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

// ====
// CORS
// ====
app.use((req, res, next) => {
  const allowedOrigins = [];

  // if (app.settings.env === "production") {
  //   allowedOrigins.forEach(origin => {
  //     res.header("Access-Control-Allow-Origin", origin);
  //   });
  // } else {
  res.header("Access-Control-Allow-Origin", "*");
  // }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// ==========
// Middleware
// ==========
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/static", express.static("static/"));
app.use(session({ secret: env.PASSPORT_SECRET }));
app.use(passport.initialize());

// ====
// Auth
// ====
require("./auth/strategies")(passport);
app.use("/auth", require("./auth/routes")(passport));

// Routes
app.post("/cloudinary", async (req, res) => {
  try {
    const uploadRes = await cloudinary.upload(req.body.file);
    res.send(uploadRes);
  } catch (err) {
    res.send(err);
  }
});

// ===================
// Production Settings
// ===================
if (app.settings.env === "production") {
  app.use(express.static("./client_build"));
  app.get("*", function(req, res) {
    res.sendFile("./client_build/index.html", { root: __dirname });
  });
}

// ======
// Server
// ======
server.listen(port, () =>
  console.log(`Listening on port ${port}, ${apolloServer.graphqlPath}`)
);
module.exports = app;
