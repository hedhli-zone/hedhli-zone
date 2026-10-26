
const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(require("cookie-parser")());
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_ID = process.env.DISCORD_ROLE_ID;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function page(title, message) {
  return `<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>HEDHLI ZONE</title>
    <style>
      body {
        background:#111827;color:white;font-family:Arial;
        text-align:center;padding:40px 15px
      }
      .card {
        background:#1f2937;padding:25px;border-radius:16px;
        max-width:420px;margin:auto
      }
      a {
        display:inline-block;background:#5865F2;color:white;
        padding:13px 20px;border-radius:9px;text-decoration:none
      }
    </style>
  </head>
  <body><div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <a href="/">Retour à l'accueil</a>
  </div></body></html>`;
}

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>HEDHLI ZONE</title>
    <style>
      body {
        background:#111827;color:white;font-family:Arial;
        text-align:center;padding:50px 15px
      }
      .card {
        background:#1f2937;padding:25px;border-radius:16px;
        max-width:400px;margin:auto
      }
      a {
        display:inline-block;background:#5865F2;color:white;
        padding:13px 20px;border-radius:9px;text-decoration:none
      }
    </style>
  </head>
  <body><div class="card">
    <h1>HEDHLI ZONE</h1>
    <p>Connecte ton compte Discord pour obtenir Verified.</p>
    <a href="/login">Se connecter avec Discord</a>
  </div></body></html>`);
});

app.get("/login", (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res.status(500).send("Configuration Discord incomplete.");
  }

  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("discord_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
    path: "/"
  });

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "identify",
    state
  });

  res.redirect(
    "https://discord.com/oauth2/authorize?" + params.toString()
  );
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  const returnedState = req.query.state;
  const savedState = req.cookies?.discord_oauth_state;
console.log("OAuth check:", {
  hasCode: typeof code === "string",
  hasReturnedState: typeof returnedState === "string",
  hasSavedState: typeof savedState === "string"
});
  res.clearCookie("discord_oauth_state", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/"
  });

  if (
    typeof code !== "string" ||
    typeof returnedState !== "string" ||
    typeof savedState !== "string" ||
    returnedState.length !== savedState.length ||
    !crypto.timingSafeEqual(
      Buffer.from(returnedState),
      Buffer.from(savedState)
    )
  ) {
    return res.status(400).send("Connexion invalide. Retourne à l'accueil et réessaie.");
  }

  if (!BOT_TOKEN || !GUILD_ID || !ROLE_ID) {
    return res.status(500).send("Configuration du bot incomplete.");
  }

  try {
    const tokenResponse = await fetch(
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
          code,
          redirect_uri: REDIRECT_URI
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("OAuth token exchange failed:", tokenData.error);
      return res.status(400).send(
        page("Connexion échouée", "Réessaie de te connecter avec Discord.")
      );
    }

    const userResponse = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization: "Bearer " + tokenData.access_token
        }
      }
    );

    const user = await userResponse.json();

    if (!userResponse.ok || !user.id) {
      return res.status(400).send(
        page("Erreur", "Impossible de vérifier ton compte Discord.")
      );
    }

    const apiBase = "https://discord.com/api/v10";
    const botHeaders = {
      Authorization: "Bot " + BOT_TOKEN
    };

    const memberResponse = await fetch(
      `${apiBase}/guilds/${GUILD_ID}/members/${user.id}`,
      { headers: botHeaders }
    );

    if (memberResponse.status === 404) {
      return res.status(403).send(
        page(
          "Rejoins le serveur",
          "Tu dois rejoindre le serveur Discord HEDHLI ZONE avant de demander Verified."
        )
      );
    }

    if (!memberResponse.ok) {
      console.error("Member check failed:", memberResponse.status);
      return res.status(502).send(
        page("Erreur", "Le bot n'a pas pu vérifier ton adhésion au serveur.")
      );
    }

    const roleResponse = await fetch(
      `${apiBase}/guilds/${GUILD_ID}/members/${user.id}/roles/${ROLE_ID}`,
      {
        method: "PUT",
        headers: botHeaders
      }
    );

    if (!roleResponse.ok) {
      const errorText = await roleResponse.text();
      console.error("Role assignment failed:", roleResponse.status, errorText);
      return res.status(502).send(
        page(
          "Rôle non attribué",
          "Vérifie que le bot a Manage Roles et que son rôle est au-dessus de Verified."
        )
      );
    }

    return res.send(
      page(
        "Bienvenue sur HEDHLI ZONE",
        `Connexion réussie pour ${user.username}. La demande de rôle Verified a réussi !`
      )
    );
  } catch (error) {
    console.error("Callback error:", error.message);
    return res.status(500).send(
      page("Erreur serveur", "Réessaie dans quelques instants.")
    );
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("HEDHLI ZONE server started.");
});
        
