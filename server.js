const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HEDHLI ZONE</title>
      <style>
        body {
          background: #111827;
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 60px 20px;
        }
        .card {
          max-width: 400px;
          margin: auto;
          padding: 28px;
          background: #1f2937;
          border-radius: 18px;
        }
        a {
          display: inline-block;
          background: #5865F2;
          color: white;
          text-decoration: none;
          padding: 14px 22px;
          border-radius: 10px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>HEDHLI ZONE</h1>
        <p>Connecte-toi avec Discord</p>
        <a href="/login">Se connecter avec Discord</a>
      </div>
    </body>
    </html>
  `);
});

app.get("/login", (req, res) => {
  res.send("Discord OAuth2 setup is not finished yet.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("HEDHLI ZONE server started on port " + PORT);
});
