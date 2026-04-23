# ArcShift: GameJam JS 2026

A tactical, turn-based mech strategy game built with Phaser 3, Vite, and TypeScript.

## Game Overview

In **ArcShift**, you take control of **CORE-01**, a powerful Technomancer capable of scavenging scrap metal from the battlefield to construct an autonomous army of mechanical units. Navigate a grid-based wasteland, manage your Action Points (AP), and tactically deploy mechs to overcome enemy forces.

## Key Features

- **Tactical Turn-Based Combat**: A deep AP-based system where every move, attack, and construction counts.
- **Scrap Economy**: Scavenge scrap metal from the environment to fuel your production.
- **Diverse Mech Ranks**:
  - **Sentinel**: Balanced tactical turret with reliable range.
  - **Heavy**: Heavily armored melee juggernaut.
  - **Drone**: Fast, agile scout for rapid deployment.
- **Technomancer Abilities**: CORE-01 can collect resources, switch weapons, and coordinate construction in real-time.
- **Smart AI**: Autonomous mech AI that balances army composition and avoids battlefield congestion.
- **Retro-Future Aesthetic**: A dark, neon-infused cyberpunk world with high-contrast UI and smooth animations.

## Controls

- **LMB (Left Click)**: Select units, target enemies, or move to grid cells.
- **Sidebar**: Access unit data, switch weapons, and initiate construction.
- **Pause (Esc)**: Access system settings, toggle Auto Mode, or exit the mission.

## How to Play

1. **Manage Action Points (AP)**: Every unit has an AP pool. Moving, attacking, and collecting resources consume AP. Your turn continues as long as you have AP remaining for your units.
2. **Collect Scrap**: Move **CORE-01** onto scrap metal tiles and use the **COLLECT** button in the sidebar. Scrap is essential for building your army.
3. **Construct Mechs**: Once you have enough scrap, use the **CONSTRUCT MACHINE** button to deploy units. Choose between Sentinels, Heavies, or Drones based on the current battlefield needs.
4. **Autonomous Combat**: Your constructed mechs will act autonomously. They will prioritize finding targets and engaging enemies based on their internal logic.
5. **Survive and Conquer**: Protect **CORE-01** while eliminating the threat. Use the **WAIT** button to preserve AP or strategically reposition when surrounded.

## Development

This project was developed using the Phaser 3 Vite TypeScript template.

### Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch the development server |
| `npm run build` | Generate a production-ready build in `dist` |

## Credits

Developed for GameJam JS 2026.
Built with [Phaser 3](https://phaser.io).
