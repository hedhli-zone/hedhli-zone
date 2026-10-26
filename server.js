
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>HEDHLI ZONE</title>
      <style>
        body {
          background: #202225;
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 60px 15px;
        }
        h1 { color: #5865F2; }
        a {
          display: inline-block;
          background: #5865F2;
          color: white;
          padding: 14px 22px;
          border-radius: 8px;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <h1>HEDHLI ZONE</h1>
      <p>Welcome to our Discord community</p>
      <p>Website setup in progress.</p>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HEDHLI ZONE website is running");
});
