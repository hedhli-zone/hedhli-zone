
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
*{box-sizing:border-box}
body{
  margin:0;min-height:100vh;padding:25px;
  display:flex;align-items:center;justify-content:center;
  font-family:Arial,sans-serif;color:white;text-align:center;
  background:radial-gradient(ellipse at top,#492080,transparent 65%),
  linear-gradient(145deg,#080711,#130b25,#080711);
}
.card{
  width:100%;max-width:520px;padding:35px 24px;
  border:1px solid #a855f766;border-radius:22px;
  background:linear-gradient(145deg,#ffffff10,#7135d615);
  box-shadow:0 0 45px #7c3aed30;
}
.crown{font-size:55px;filter:drop-shadow(0 0 15px #a855f7)}
.brand{font-size:13px;letter-spacing:3px;color:#c4b5fd}
h1{font-size:clamp(27px,6vw,38px);overflow-wrap:anywhere}
h1 span{color:#bd78ff}
p{color:#d4cde5;line-height:1.8;overflow-wrap:anywhere}
.status{margin:22px 0;color:#86efac;font-size:14px}
a{
  display:inline-block;margin-top:12px;padding:14px 22px;
  color:white;text-decoration:none;font-weight:bold;border-radius:10px;
  background:linear-gradient(90deg,#7135d6,#5265f5);
  box-shadow:0 0 24px #7438d655;
}
</style>
</head>
<body>
<div class="card">
  <div class="crown">👑</div>
  <div class="brand">HEDHLI ZONE · DISCORD</div>
  <h1><span>${escapeHtml(title)}</span></h1>
  <p>${escapeHtml(message)}</p>
  <div class="status">✦ SYSTÈME DE VÉRIFICATION</div>
  <a href="/">← Retour à l'accueil</a>
</div>
</body>
</html>`;
}



app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HEDHLI ZONE</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  min-height:100vh;
  font-family:Arial,sans-serif;
  color:#fff;
  background:
    radial-gradient(ellipse at 50% 0%,#492080 0%,transparent 55%),
    linear-gradient(145deg,#080711,#130b25 55%,#080711);
}
nav{
  display:flex;justify-content:space-between;align-items:center;
  padding:22px 7%;border-bottom:1px solid #ffffff18;
}
.logo{font-size:22px;font-weight:900;letter-spacing:2px}
.logo span{color:#a855f7}
.tag{color:#c4b5fd;font-size:12px}
main{max-width:1000px;margin:auto;padding:65px 20px;text-align:center}
.crown{font-size:58px;filter:drop-shadow(0 0 20px #a855f7)}
h1{font-size:clamp(38px,8vw,68px);margin:15px 0}
h1 span{color:#b76aff;text-shadow:0 0 25px #8129d6}
.intro{color:#c4bfd7;line-height:1.8;max-width:570px;margin:0 auto 30px}
.button{
 display:inline-block;background:linear-gradient(90deg,#7135d6,#5265f5);
 color:white;text-decoration:none;padding:15px 25px;border-radius:10px;
 font-weight:bold;box-shadow:0 0 25px #7438d655;
}
.panel{
 max-width:600px;margin:45px auto 0;padding:25px;
 border:1px solid #9b5cff55;border-radius:18px;
 background:linear-gradient(135deg,#ffffff0b,#8b5cf610);
 box-shadow:0 0 35px #6515a522;
}
.panel h2{margin-top:0}
.panel p{color:#c4bfd7;line-height:1.7}
.status{color:#86efac;font-weight:bold}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:15px;margin-top:25px}
.feature{padding:20px;border-radius:14px;background:#ffffff08;border:1px solid #ffffff15}
.feature b{color:#d8b4fe}
.feature p{font-size:14px;color:#bdb7ce;line-height:1.6}
footer{padding:25px;text-align:center;color:#88819e;font-size:12px}
</style>
</head>
<body>
<nav>
  <div class="logo">👑 HEDHLI <span>ZONE</span></div>
  <div class="tag">COMMUNAUTÉ DISCORD</div>
</nav>
<main>
  <div class="crown">👑</div>
  <div class="tag">BIENVENUE DANS NOTRE UNIVERS</div>
  <h1>HEDHLI <span>ZONE</span></h1>
  <p class="intro">
    Rejoins notre communauté Discord, connecte ton compte
    et demande ton rôle Verified en quelques secondes.
  </p>
  <a class="button" href="/login">✦ Se connecter avec Discord</a>
  <section class="panel">
    <h2>✦ Accès vérifié</h2>
    <p>Connecte ton compte Discord pour demander ton rôle sur le serveur.</p>
    <div class="status">● Système de vérification</div>
  </section>
  <section class="features">
    <div class="feature"><b>👑 Communauté</b><p>Rejoins l'univers HEDHLI ZONE.</p></div>
    <div class="feature"><b>🛡️ Verified</b><p>Demande ton rôle de membre vérifié.</p></div>
    <div class="feature"><b>💜 Espace gaming</b><p>Un espace pensé pour les passionnés de jeux.</p></div>
  </section>
</main>
<footer>© 2026 HEDHLI ZONE · Tous droits réservés</footer>
</body>
</html>`);
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

    
return res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HEDHLI ZONE</title>
<style>
body {
  background: #140c28;
  color: white;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 50px 15px;
}
a {
  color: #c9a0ff;
  font-size: 18px;
}
</style>
</head>
<body>
<h1>HEDHLI ZONE</h1>
<p>Connexion réussie pour ${user.username}.</p>
<p>La demande de rôle Verified a réussi !</p>
<p>Retour à l'application...</p>
<a href="hedhli-zone://verified">Ouvrir HEDHLI ZONE</a>
<script>
setTimeout(function() {
  window.location.href = "hedhli-zone://verified";
}, 1500);
</script>
</body>
</html>
`);
    
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
      flags: 64
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
      
