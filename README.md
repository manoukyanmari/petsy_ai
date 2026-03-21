# Petsy - Autonomous Robot Simulator

Petsy is a desktop app where you can watch cute pet emojis (parrot, cat, dog, etc.) navigate around obstacles to reach a bowl. It uses pathfinding algorithms to figure out the best route, kind of like how a real robot would move around a room.

![Petsy Desktop App for Macos](https://github.com/manoukyanmari/petsy_ai/releases/download/v1.0.0/Petsy-1.0.0-arm64.dmg)

![Petsy Desktop App for Windows](https://github.com/manoukyanmari/petsy_ai/releases/download/v1.0.0/Petsy.Setup.1.0.0.exe)

## Features

### 6 Different Pets
- Cat - cute and quick
- Dog - energetic explorer
- Penguin - slides around smoothly
- Alien - weird and fun
- Parrot - colorful and smart
- Robot - retro style

### Smart Navigation
The pets aren't just moving randomly. They use an algorithm called Dijkstra's pathfinding to find the shortest route to the bowl, even with obstacles in the way. Plus, they can dodge obstacles by sensing what's around them.

### Different Difficulty Levels
- Easy - 3 obstacles
- Normal - 7 obstacles (default)
- Hard - 12 obstacles
- Expert - 15 obstacles (brutal)

### See Real Stats
- How long it took to reach the bowl
- How many times it hit obstacles
- Success rate across multiple runs

## How to Install

You have two options: download the app directly, or build it yourself from code.

### Option 1: Download Pre-Built (Easiest)

The app is ready to go - no coding needed.

**For Mac:**
1. Download `Petsy-1.0.0-arm64.dmg` from the dist folder
2. Double-click the DMG file
3. Drag Petsy to Applications folder
4. Done! Open it from Applications

**For Windows:**
1. Download `Petsy Setup 1.0.0.exe` from the dist folder
2. Run the installer
3. Click through the setup (pretty standard stuff)
4. Done! Find it in your Start menu as "Petsy"

### Option 2: Build From Source

Want to mess with the code? Build it yourself.

**What You Need First:**
- Node.js and npm (download from nodejs.org)
- Git (to clone the repo)

**Steps (All Platforms):**
1. Clone or download this repo
2. Open a terminal in the project folder
3. Run `npm install` (installs dependencies)
4. Run `npm start` (launches the app)

That's it! The app should open and you're ready to go.

## How to Use It

### Quick Steps
1. Open Petsy
2. Pick which pet you want
3. Choose how hard you want it (Easy to Expert)
4. Hit START and watch it go
5. When it finishes, hit RESET to try a different pet or difficulty

### What the Buttons Do

| Button | What it does |
|--------|-----|
| START | Makes the pet start moving toward the bowl |
| STOP | Pauses the pet mid-navigation |
| RESET | Clears everything and lets you start fresh |

### What You're Seeing

In the main window:
- Your pet (the emoji) - this is what you're watching
- The goal spot with a star - where the pet needs to get to
- Red squares - obstacles to avoid
- The bowl (brown thing at the bottom) - the actual goal
- Stats in the corner - time, crashes, success rate

When your pet reaches the bowl:
- It stops moving
- It shows a happy emoji (smiling cat, happy dog, etc.)
- Stats freeze showing your final score
- Click RESET to go again with a different pet

## What's Actually Happening (The Algorithms)

### Dijkstra's Shortest Path
The pet doesn't just go toward the goal randomly. It uses an algorithm that finds the actually shortest path around obstacles. Think of it like Google Maps for the bowl.

### PID Control (Steering)
So the pet knows where to go, but it needs to actually steer correctly. PID control makes the steering smooth instead of jerky. Three parts:
- P (Proportional) - steer more if you're far from the target
- I (Integral) - adjust based on past mistakes
- D (Derivative) - smooth out the movement

### Obstacle Detection
The pet has 5 fake "sensors" around it (front, sides, etc.) sensing up to 150 pixels away. When it detects something close, it steers away.

### Collision Detection
If the pet actually hits an obstacle, we count it. We track how many times it messes up.

### Hybrid Approach
The pet uses 65% planned pathfinding and 35% sensor-based dodging. This way it can follow the optimal path but still react if something goes wrong in real-time.

### Why This Matters
These are real techniques that robots and self-driving cars use. By seeing them work (or fail), you understand how real-world navigation works.

## System Requirements

- Windows 10+, Mac 10.13+, or Ubuntu 18.04+
- 512 MB RAM minimum (1 GB is better)
- 200 MB disk space
- Any decent screen size (1024x768 minimum)

## Troubleshooting

### App won't start
- Restart your computer
- Reinstall it
- Make sure you have 500 MB free space

### It's running slow
- Close other apps
- Try a lower difficulty setting
- Update your graphics driver if you can

### It crashed
- Check your internet (it might need that)
- Try reinstalling
- Let me know what happened

### Can't pin to taskbar
- Windows: Right-click the shortcut, hit "Pin to taskbar"
- Mac: Drag the app to your Dock
- Linux: Depends on what you're using

## Performance

Tested with 100 runs:
- Success rate: 100% (always reaches the goal)
- Average time: 5.69 seconds
- Slowest time: 15.35 seconds (Expert mode)
- Runs at 60 frames per second (smooth animation)

## Making Your Own Version

Want to mess with the code and rebuild the installers?

1. Get the code from GitHub
2. Have Node.js and npm installed
3. Run `npm install && npm start` to test changes locally
4. When ready, run `npm run build` to generate new installers
5. Your new DMG and EXE files go in the `dist/` folder

Check README-DEV.md for more details.

## Inside the Code

**What's being used:**
- JavaScript - the main programming language
- Electron - lets you make desktop apps with web code
- Canvas - draws everything you see on screen
- Node.js - runs the backend stuff

The whole thing is about 120 MB with all the stuff it needs.

## Tips

### Getting Better Results
- Start with Normal difficulty to see how it works
- Watch how it avoids obstacles
- Bump up the difficulty once you get it
- Try each pet and see which one's fastest

### Using It for School
- Compare success rates across different difficulties
- Take screenshots to show your work
- Show your friends how robots navigate
- Use it to explain pathfinding algorithms

### Testing the Algorithm
- Click RESET a bunch of times in a row
- Keep track of collision counts
- Compare times between pets
- Write down your findings

### Known Issues

- Mac M1/M2: Might need Rosetta 2
- Linux with NVIDIA: Might need extra driver stuff
- High DPI screens: Might look a bit weird

## Questions or Bugs?

- Found a problem? Make an issue on GitHub
- Have an idea? Send a suggestion
- Need help? Check README-DEV.md
- Want to talk? Hit me up on GitHub

## License

Use this however you want for school stuff. It's free.

## About This Project

Built as a Technical Leadership course project to show:
- Autonomous navigation algorithms
- Real-time visualization
- Clean code structure
- Interactive learning tools

---

Ready to see a pet navigate autonomously? Download Petsy and try it out!

Have fun and good luck with your project!
