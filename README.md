# Neon Drift 3D: Multiplayer Car Rush

A small browser car game with a 3D chase-camera feel, real local multiplayer, game objects, boost pickups, bump scoring, and a neon city-track vibe.

## Run it

If `npm` is not recognized on your computer, use the included launcher:

```powershell
.\start-game.bat
```

Or double-click `start-game.bat`.

If you do have Node/npm installed globally, this also works:

```powershell
cd multiplayer-car-rush
npm start
```

Then open:

```text
http://localhost:3000
```

For multiplayer, open the same URL in another tab. To play from another device on the same Wi-Fi, use the host computer's local IP address instead of `localhost`, for example `http://192.168.1.20:3000`.

## Controls

- `WASD` or arrow keys to drive
- `Space` for turbo
- Collect glowing turbo cells for points
- Bump rivals while moving fast for bonus points

## How multiplayer works

The server uses built-in Node.js only:

- `POST /api/join` creates a player object
- `POST /api/state` receives local car state
- `GET /api/events` streams everyone else's state with Server-Sent Events

No package install is required beyond having Node.js.

## Putting it on GitHub

This project is ready to push to GitHub as normal source code.

```powershell
git add multiplayer-car-rush
git commit -m "Add Neon Drift 3D multiplayer car game"
git push
```

Important: GitHub Pages can host static files, but it cannot run `server.js`, so the game falls back to solo mode there. For live multiplayer online, deploy the folder to a Node hosting service such as Render, Railway, Fly.io, or a VPS.
