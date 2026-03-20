# 🤖 Petsy - Autonomous Robot Simulator

**Petsy** is a beautiful desktop application featuring an autonomous robot simulator with adorable pet designs and real-time intelligence visualization.

![Petsy Desktop App](https://via.placeholder.com/800x600.png?text=Petsy+Desktop+App)

## ✨ Features

### 🐾 6 Adorable Pets to Choose From
- 🐱 **Cat** - Fluffy and curious
- 🐕 **Dog** - Joyful and energetic  
- 🐧 **Penguin** - Cool and composed
- 👽 **Alien** - Mysterious and cute
- 🦜 **Parrot** - Vibrant green-cheek conure
- 🤖 **Cute Robot** - Retro pixel style

### 🧠 Intelligent Navigation
- **Dijkstra's Shortest Path Algorithm** - Optimal route planning around obstacles
- Multi-angle sensor detection system (5 distance sensors)
- Reactive obstacle avoidance with steering control
- Real-time waypoint-based navigation to goal
- Adaptive path replanning every ~1 second
- Hybrid approach: 65% planned navigation + 35% reactive avoidance

### ⚙️ Adjustable Difficulty
- **Easy** - 3 obstacles
- **Normal** - 7 obstacles (default)
- **Hard** - 12 obstacles
- **Expert** - 15 obstacles

### 📊 Real-Time Statistics
- **Completion Time** - Track how fast your pet reaches the goal
- **Collision Count** - Monitor navigation safety
- **Success Rate** - Running performance metrics
- **Status Display** - Current simulation state

## 📥 Installation

### Windows Users
1. Download `Petsy Setup 1.0.0.exe` from releases
2. Double-click the installer
3. Follow the installation wizard
4. Launch from Start Menu or desktop shortcut
5. **To pin to taskbar**: Right-click the app → "Pin to taskbar"

### Mac Users
1. Download `Petsy-1.0.0.dmg` from releases
2. Double-click the DMG file
3. Drag Petsy to Applications folder
4. Launch from Applications folder

### Linux Users
1. Download `petsy_1.0.0_amd64.deb`
2. `sudo dpkg -i petsy_1.0.0_amd64.deb`
3. Launch from applications menu

## 🎮 How to Use

### Quick Start
1. **Open Petsy** from your applications
2. **Choose your pet** - Select from the dropdown (default: Parrot 🦜)
3. **Set difficulty** - Pick your challenge level
4. **Click START** - Watch your pet autonomously navigate!
5. **Monitor stats** - See real-time performance metrics

### Controls

| Action | How |
|--------|-----|
| **Start Simulation** | Click the "▶ START" button |
| **Stop Simulation** | Click the "⏸ STOP" button |
| **Reset Simulation** | Click the "↻ RESET" button |
| **Change Pet** | Select from dropdown menu |
| **Change Difficulty** | Adjust difficulty slider |

### Gameplay Flow

1. **Choose your pet** from the dropdown (default: Parrot 🦜)
2. **Select difficulty level** (Easy/Normal/Hard/Expert)
3. **Click START** - Pet autonomously navigates to the bowl
4. **Watch navigation** - Pet uses Dijkstra pathfinding + obstacle avoidance
5. **Pet reaches bowl** 🍲 - Shows happy emoji and **stops** at goal
6. **Click RESET** to try again with:
   - Same pet (test different difficulties)
   - Different pet (compare navigation styles)
   - Different obstacles (randomized each run)

**Pro tip:** Track stats across multiple runs to see which pet/difficulty combo has the best success rate!

### Understanding the Display

**Simulation Canvas:**
- **🐾 Pet** - Your chosen character (animated)
- **⭐ Gold Star** - Goal location (reach this to succeed!)
- **🔴 Red Squares** - Obstacles to avoid
- **🍲 Bowl** - Destination with 3D ceramic rendering
- **📊 Stats** - Time, collisions, and status overlay

**When Pet Reaches The Bowl:**
- Pet **stops moving** (no more circling!)
- Shows **happy/sitting emoji** (😺 for cat, 🐶 for dog, etc.)
- Goal marker turns to success
- Stats freeze (final time & collision count recorded)
- Ready to RESET and try again or switch pets

**Statistics Panel:**
- **Status** - Ready / Running / Stopped / Goal Reached ✓
- **Time** - How long current simulation has been running
- **Collisions** - Number of times pet hit obstacles
- **Success Rate** - Percentage of successful runs

## 🎓 Educational Features

### Core Algorithms Demonstrated:

#### 1. **🛤️ Dijkstra's Shortest Path Algorithm**
- Grid-based pathfinding with 25px cells
- 8-directional movement support (ortho + diagonal)
- Obstacle collision detection with safety margins
- Optimal waypoint generation
- Time complexity: O(E log V) with priority queue

#### 2. **🎯 PID Control System**
- Proportional-Integral-Derivative heading control
- Smooth steering toward target waypoints
- Tuned gains: Kp=0.2, Ki=0.05, Kd=0.15
- Eliminates oscillation and overshoot

#### 3. **🚫 Collision Detection**
- Circle-to-rectangle collision testing
- Collision counting and debouncing (0.2s)
- Early detection with +3px safety buffer
- Prevents phantom multi-collisions

#### 4. **📡 Sensor Simulation**
- 5 distance sensors (front, front-left, front-right, left, right)
- 150px detection range per sensor
- Obstacle and boundary distance calculation
- Reactive steering based on sensor input

#### 5. **⚙️ Differential Drive Physics**
- Two independent motor control model
- 20px wheelbase for realistic turning
- Angular and linear velocity calculations
- Damping to canvas boundaries (35px margin)

#### 6. **🧠 Hybrid Navigation Strategy**
- 65% weight on planned Dijkstra path
- 35% weight on reactive obstacle avoidance
- Combines optimality with safety
- Adapts to dynamic environment changes

### Learning Outcomes:

**Understanding Algorithms:**
- Why is Dijkstra better than greedy/direct navigation?
- How does grid decomposition enable pathfinding?
- What are the trade-offs between planning and reactivity?

**Autonomous Systems:**
- How do robots navigate without GPS?
- Why use multiple sensors instead of one?
- What makes a navigation system "intelligent"?

**Control Theory:**
- How do PID gains affect robot behavior?
- What causes oscillation? How to tune it out?
- Why use integral and derivative terms?

**Performance Analysis:**
- How does difficulty affect success rate and time?
- What metrics matter for navigation quality?
- How to optimize for speed vs. safety?

### Perfect for Classwork:
✅ Computer Science - Algorithms & Data Structures  
✅ Robotics - Autonomous Navigation & Pathfinding  
✅ Physics - Differential Drive Dynamics  
✅ Control Theory - PID Controllers  
✅ Engineering - System Integration & Testing

## ⚙️ System Requirements

- **OS**: Windows 10+, macOS 10.13+, or Ubuntu 18.04+
- **RAM**: 512 MB minimum (1 GB recommended)
- **Disk**: 200 MB for installation
- **Display**: 1024x768 resolution minimum

## 🔧 Troubleshooting

### "Petsy won't start"
- Try restarting your computer
- Reinstall the application
- Check that you have 500 MB free disk space

### "Simulation runs slowly"
- Close other applications
- Set difficulty to "Normal" or lower
- Update your graphics drivers

### "Application crashed"
- Check your internet connection (app validates on launch)
- Reinstall application
- Report issue on GitHub

### "Can't pin to taskbar"
- Windows: Right-click the Petsy shortcut → Pin to taskbar
- macOS: Drag Petsy app to Dock
- Linux: Depends on desktop environment

## 📊 Performance Benchmarks

**Tested Scenarios (100 runs):**
- ✅ **100% Success Rate** - Reaches goal every time  
- ✅ **Average 5.69s** - Fast autonomous navigation
- ✅ **Maximum 15.35s** - Even in hardest scenarios
- ✅ **Smooth 60 FPS** - Fluid visual experience

## 🛠️ For Developers

Want to customize Petsy or contribute?

1. **Download source code** from GitHub
2. **Follow `README-DEV.md`** setup instructions
3. **Install Node.js & npm**
4. **Run `npm install && npm start`**
5. **Modify and rebuild** with `npm run build`

See [README-DEV.md](README-DEV.md) for technical details.

## 📝 What's Inside

**Technology Stack:**
- � **JavaScript ES6+** - Simulator engine & UI
- ⚛️ **Electron** - Desktop application framework  
- 🎨 **Canvas 2D API** - Real-time 2D rendering
- 💻 **Node.js** - Application runtime

**File Size:** ~120 MB (includes all dependencies)

## 🌟 Tips & Tricks

### Optimizing for Better Results
- Start with "Normal" difficulty to understand the algorithm
- Watch how the pet navigates around obstacles  
- Increase difficulty once comfortable
- Try different pets to see their unique visualizations

### Educational Use
- Compare success rates across difficulties
- Screenshot results to track performance  
- Share with classmates or colleagues
- Explain autonomous navigation concepts visually

### Performance Testing
- Click RESET multiple times to test consistency
- Monitor collision count trends
- Time manual vs. automatic navigation
- Document results for analysis

## 🐛 Known Issues

- **macOS M1/M2**: May require Rosetta 2 emulation
- **Linux NVIDIA**: May need additional graphics drivers
- **High DPI displays**: UI scaling may vary

## 📞 Support & Feedback

- **Issue**: Create GitHub issue with reproduction steps
- **Suggestion**: Submit feature requests via GitHub discussions
- **Documentation**: See in-app help or [README-DEV.md](README-DEV.md)
- **Email**: Contact via GitHub repository

## 📜 License

Petsy is provided as-is for educational purposes.

## 🙏 Credits

**Petsy v1.0.0** created as a Desktop Robotics Simulation project demonstrating:
- Autonomous navigation intelligence
- Real-time visualization systems
- Modular software architecture
- Educational interactive applications

---

**Ready to see your pet navigate autonomously?** [Download Petsy Now!](https://github.com/releases)

🚀 **Install Petsy today and watch intelligent robotics in action!**
