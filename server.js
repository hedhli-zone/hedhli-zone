
const express = require("express");
const crypto = require("crypto");
const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const app = express();
app.use(require("cookie-parser")());

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_ID = process.env.DISCORD_ROLE_ID;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
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
body{background:#111827;color:white;font-family:Arial;text-align:center;padding:40px 15px}
.card{background:#1f2937;padding:25px;border-radius:16px;max-width:420px;margin:auto}
a{display:inline-block;background:#5865F2;color:white;padding:13px 20px;border-radius:9px;text-decoration:none}
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
body{background:#111827;color:white;font-family:Arial;text-align:center;padding:50px 15px}
.card{background:#1f2937;padding:25px;border-radius:16px;max-width:400px;margin:auto}
a{display:inline-block;background:#5865F2;color:white;padding:13px 20px;border-radius:9px;text-decoration:none}
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

  res.redirect("https://discord.com/oauth2/authorize?" + params.toString());
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  const returnedState = req.query.state;
  const savedState = req.cookies?.discord_oauth_state;

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
    !crypto.timingSafeEqual(Buffer.from(returnedState), Buffer.from(savedState))
  ) {
    return res.status(400).send("Connexion invalide. Retourne à l'accueil et réessaie.");
  }

  if (!BOT_TOKEN || !GUILD_ID || !ROLE_ID) {
    return res.status(500).send("Configuration du bot incomplete.");
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(400).send(page("Connexion échouée", "Réessaie de te connecter avec Discord."));
    }

    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: "Bearer " + tokenData.access_token }
    });

    const user = await userResponse.json();

    if (!userResponse.ok || !user.id) {
      return res.status(400).send(page("Erreur", "Impossible de vérifier ton compte Discord."));
    }

    const apiBase = "https://discord.com/api/v10";
    const botHeaders = { Authorization: "Bot " + BOT_TOKEN };

    const memberResponse = await fetch(
      `${apiBase}/guilds/${GUILD_ID}/members/${user.id}`,
      { headers: botHeaders }
    );

    if (memberResponse.status === 404) {
      return res.status(403).send(page("Rejoins le serveur", "Tu dois rejoindre le serveur Discord HEDHLI ZONE avant de demander Verified."));
    }

    if (!memberResponse.ok) {
      return res.status(502).send(page("Erreur", "Le bot n'a pas pu vérifier ton adhésion au serveur."));
    }

    const roleResponse = await fetch(
      `${apiBase}/guilds/${GUILD_ID}/members/${user.id}/roles/${ROLE_ID}`,
      { method: "PUT", headers: botHeaders }
    );

    if (!roleResponse.ok) {
      console.error("Role assignment failed:", roleResponse.status, await roleResponse.text());
      return res.status(502).send(page("Rôle non attribué", "Vérifie la permission Manage Roles et la position du rôle du bot."));
    }

    return res.send(page("Bienvenue sur HEDHLI ZONE", `Connexion réussie pour ${user.username}. La demande de rôle Verified a réussi !`));
  } catch (error) {
    console.error("OAuth callback error:", error.message);
    return res.status(500).send(page("Erreur serveur", "Réessaie dans quelques instants."));
  }
});

// Discord button bot
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds]
});

discordClient.once(Events.ClientReady, async readyClient => {
  console.log(`Discord bot connected: ${readyClient.user.tag}`);

  if (!CHANNEL_ID) {
    console.error("DISCORD_CHANNEL_ID is missing.");
    return;
  }

  try {
    const channel = await readyClient.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased() || !channel.messages) {
      console.error("The configured channel is not a text channel.");
      return;
    }

    const recentMessages = await channel.messages.fetch({ limit: 25 });

    const buttonAlreadyExists = recentMessages.some(message =>
      message.author.id === readyClient.user.id &&
      message.components.some(row =>
        row.components.some(component =>
          component.customId === "claim_verified_role"
        )
      )
    );

    if (!buttonAlreadyExists) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim_verified_role")
          .setLabel("🎖️ تفعيل الرتبة")
          .setStyle(ButtonStyle.Primary)
      );

      await channel.send({
        content: "اضغط على الزرّ لتطلب رتبة Verified.",
        components: [row]
      });

      console.log("Verification button posted.");
    }
  } catch (error) {
    console.error("Could not post verification button:", error.message);
  }
});

discordClient.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton() || interaction.customId !== "claim_verified_role") {
    return;
  }

  if (!interaction.inGuild() || interaction.guildId !== GUILD_ID) {
    return interaction.reply({
      content: "الزرّ هذا موش مفعّل في السيرفر هذا.",
      ephemeral: true
    });
  }

  if (!ROLE_ID || !BOT_TOKEN) {
    return interaction.reply({
      content: "إعدادات الرتبة ناقصة. اتصل بمسؤول السيرفر.",
      ephemeral: true
    });
  }

  try {
    await interaction.deferReply({ flags: 64 });

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${interaction.user.id}/roles/${ROLE_ID}`,
      {
        method: "PUT",
        headers: { Authorization: "Bot " + BOT_TOKEN }
      }
    );

    if (response.ok) {
      return interaction.editReply("تم تفعيل رتبة Verified بنجاح! 🎉");
    }

    console.error("Button role assignment failed:", response.status, await response.text());

    return interaction.editReply(
      "ما نجّمش نفعّل الرتبة. تأكّد من صلاحية Manage Roles وترتيب رتبة البوت."
    );
  } catch (error) {
    console.error("Button interaction error:", error.message);

    if (interaction.deferred) {
      return interaction.editReply("صار خطأ. جرّب مرة أخرى بعد شوية.");
    }
  }
});

if (BOT_TOKEN) {
  discordClient.login(BOT_TOKEN).catch(error => {
    console.error("Discord bot login failed:", error.message);
  });
} else {
  console.error("DISCORD_BOT_TOKEN is missing; Discord button bot is disabled.");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("HEDHLI ZONE server started.");
});
      
