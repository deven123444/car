# Neon Traffic City - GitHub Pages Edition

A 3D car driving game made as a static HTML game for GitHub Pages.

## Features

- 3D car driving
- Traffic cars
- NPC pedestrians
- City roads and buildings
- Coins
- Nitro
- Engine upgrades
- Health/crash system
- Main menu
- Free Drive and Traffic Rush modes
- Radar/minimap-style dots
- Challenges/missions

## How to upload to GitHub

1. Create a new GitHub repository.
2. Upload `index.html`, `README.md`, and `.nojekyll`.
3. Go to **Settings**.
4. Go to **Pages**.
5. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Click **Save**.
7. GitHub will give you a website link.

## Multiplayer note

GitHub Pages only hosts static files, so it cannot run a WebSocket server by itself.
That means true worldwide multiplayer needs one of these:

- A separate backend server
- Firebase/Supabase realtime
- PeerJS/WebRTC
- Cloudflare Worker/Durable Object
- Render/Railway/Glitch/Node server

This version works directly on GitHub Pages as a single-player game.
