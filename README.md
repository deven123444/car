# Neon Traffic City P2P Multiplayer

GitHub Pages version with multiplayer and **no Firebase**.

This uses:
- GitHub Pages for hosting the static `index.html`
- PeerJS/WebRTC for peer-to-peer player syncing

## How multiplayer works

1. One player opens the game and clicks **Host**.
2. They pick or get a room code.
3. Other players type the same room code and click **Join**.
4. Player cars sync live.

## Upload to GitHub Pages

Upload:

- `index.html`
- `.nojekyll`
- `README.md`

Then enable GitHub Pages:

1. Repository **Settings**
2. **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`
5. Folder: `/root`
6. Save

## Important limits

This version does not use Firebase or your own server, but it still uses the public PeerJS signaling service so browsers can find each other. The game data itself is sent peer-to-peer with WebRTC.

If the school/PC network blocks WebRTC or PeerJS, multiplayer may not connect on that network.
