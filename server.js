const express = require("express");
const app = express();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>HEDHLI ZONE</title>
        <style>
          body {
            background: #111827;
            color: white;
            font-family: Arial;
            text-align: center;
            padding: 50px 15px;
          }
          .card {
            background: #1f2937;
            padding: 25px;
            border-radius: 16px;
            max-width: 400px;
            margin: auto;
          }
          a {
            display: inline-block;
            background: #5865F2;
            color: white;
            padding: 13px 20px;
            border-radius: 9px;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>HEDHLI ZONE</h1>
          <p>Connecte ton compte Discord</p>
          <a href="/login">Se connecter avec Discord</a>
        </div>
      </body>
    </html>
  `);
});

app.get("/login", (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res.status(500).send("Configuration Discord incomplete.");
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "identify"
  });

  res.redirect(
    "https://discord.com/oauth2/authorize?" + params.toString()
  );
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Code Discord manquant.");
  }

  try {
    const response = await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error("Discord OAuth error:", data.error || response.status);
      return res.status(400).send("Discord login failed. Please try again.");
    }

    const userResponse = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization: "Bearer " + data.access_token
        }
      }
    );

    const user = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(400).send("Could not retrieve Discord profile.");
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>HEDHLI ZONE</title>
      </head>
      <body style="background:#111827;color:white;font-family:Arial;text-align:center;padding:40px">
        <h1>Welcome to HEDHLI ZONE</h1>
        <p>Discord login successful!</p>
        <p>Username: ${String(user.username).replace(/[&<>"']/g, "")}</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth callback failed:", error.message);
    res.status(500).send("Server error. Please try again later.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("HEDHLI ZONE server started.");
});
