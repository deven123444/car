const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const players = new Map();
const clients = new Map();
let boosts = spawnBoosts();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function spawnBoosts() {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `boost-${index}`,
    x: 120 + Math.random() * 1360,
    y: 120 + Math.random() * 760,
  }));
}

function colorFromName(name) {
  const colors = ["#ffcf33", "#39ff88", "#53d8ff", "#ff5cc8", "#ff6b35", "#b8ff4d", "#b794f6"];
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash + name.charCodeAt(index) * (index + 3)) % colors.length;
  }
  return colors[hash];
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    x: Math.round(player.x),
    y: Math.round(player.y),
    angle: player.angle,
    speed: player.speed,
    score: player.score,
    boost: Math.round(player.boost),
    lastSeen: player.lastSeen,
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function broadcast() {
  const payload = `data: ${JSON.stringify({
    players: Array.from(players.values()).map(publicPlayer),
    boosts,
    serverTime: Date.now(),
  })}\n\n`;

  for (const response of clients.values()) {
    response.write(payload);
  }
}

function cleanStalePlayers() {
  const now = Date.now();
  for (const [id, player] of players.entries()) {
    if (now - player.lastSeen > 7000) {
      players.delete(id);
      clients.delete(id);
    }
  }
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, relativePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  });
}

async function handleApi(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "POST" && requestUrl.pathname === "/api/join") {
    const body = JSON.parse(await readRequestBody(request) || "{}");
    const name = String(body.name || "Road Goblin").slice(0, 18);
    const id = randomUUID();
    const player = {
      id,
      name,
      color: colorFromName(`${name}-${id}`),
      x: 180 + Math.random() * 1220,
      y: 160 + Math.random() * 680,
      angle: Math.random() * Math.PI * 2,
      speed: 0,
      score: 0,
      boost: 100,
      lastSeen: Date.now(),
    };
    players.set(id, player);
    sendJson(response, 200, { player: publicPlayer(player) });
    broadcast();
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/state") {
    const body = JSON.parse(await readRequestBody(request) || "{}");
    const player = players.get(body.id);

    if (!player) {
      sendJson(response, 404, { error: "Player not found" });
      return;
    }

    player.x = clamp(Number(body.x) || player.x, 40, 1560);
    player.y = clamp(Number(body.y) || player.y, 40, 960);
    player.angle = Number(body.angle) || 0;
    player.speed = clamp(Number(body.speed) || 0, -10, 16);
    player.boost = clamp(Number(body.boost) || 0, 0, 100);
    player.score = Math.max(player.score, Number(body.score) || 0);
    player.lastSeen = Date.now();

    const collectedBoostId = typeof body.collectedBoostId === "string" ? body.collectedBoostId : "";
    if (collectedBoostId) {
      const boostIndex = boosts.findIndex((boost) => boost.id === collectedBoostId);
      if (boostIndex !== -1) {
        boosts.splice(boostIndex, 1, {
          id: `boost-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          x: 120 + Math.random() * 1360,
          y: 120 + Math.random() * 760,
        });
      }
    }

    sendJson(response, 200, { ok: true });
    broadcast();
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/events") {
    const id = requestUrl.searchParams.get("id");

    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    response.write("\n");

    if (id) {
      clients.set(id, response);
    }

    request.on("close", () => {
      if (id) {
        clients.delete(id);
      }
    });

    broadcast();
    return;
  }

  sendJson(response, 404, { error: "Unknown API route" });
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/")) {
    handleApi(request, response).catch((error) => {
      sendJson(response, 500, { error: error.message });
    });
    return;
  }

  serveStatic(request, response);
});

setInterval(() => {
  cleanStalePlayers();
  broadcast();
}, 1000 / 12);

server.listen(PORT, () => {
  console.log(`Car Rush is live at http://localhost:${PORT}`);
  console.log("Open the URL in two browser tabs/devices for multiplayer.");
});
