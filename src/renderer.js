// Petsy Renderer Process - Handles UI and runs simulation locally

class PetsyApp {
    constructor() {
        console.log('🔧 PetsyApp constructor called');
        this.simulator = new Simulator();
        this.isRunning = false;
        this.currentPet = 'parrot';
        this.currentDifficulty = 'normal';
        this.successCount = 0;
        this.totalRuns = 0;

        console.log('✓ Properties initialized');
        this.initElements();
        console.log('✓ Elements initialized');
        this.setupEventListeners();
        console.log('✓ Event listeners setup');
        this.initializeApp();
        console.log('✓ App initializing...');
    }

    initElements() {
        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resetBtn = document.getElementById('reset-btn');

        console.log('✓ Buttons found:');
        console.log('  START:', this.startBtn ? 'Yes' : 'NO ❌');
        console.log('  STOP:', this.stopBtn ? 'Yes' : 'NO ❌');
        console.log('  RESET:', this.resetBtn ? 'Yes' : 'NO ❌');

        // Selectors
        this.petSelector = document.getElementById('pet-design');
        this.difficultySelector = document.getElementById('difficulty');

        console.log('✓ Selectors found:');
        console.log('  Pet:', this.petSelector ? 'Yes' : 'NO ❌');
        console.log('  Difficulty:', this.difficultySelector ? 'Yes' : 'NO ❌');

        // Canvas
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d');

        console.log('✓ Canvas:', this.canvas ? 'Yes' : 'NO ❌');

        // Stats
        this.statusEl = document.getElementById('status');
        this.timeEl = document.getElementById('time');
        this.collisionsEl = document.getElementById('collisions');
        this.successRateEl = document.getElementById('success-rate');

        // Modal
        this.aboutModal = document.getElementById('about-modal');
        this.closeAboutBtn = document.getElementById('close-about');
    }

    setupEventListeners() {
        // Button events - SIMPLE synchronous handlers
        this.startBtn.addEventListener('click', () => {
            console.log('👉 START BUTTON CLICKED');
            this.startSimulation();
        });
        this.stopBtn.addEventListener('click', () => {
            console.log('👉 STOP BUTTON CLICKED');
            this.stopSimulation();
        });
        this.resetBtn.addEventListener('click', () => {
            console.log('👉 RESET BUTTON CLICKED');
            this.resetSimulation();
        });

        // Selector events
        this.petSelector.addEventListener('change', (e) => {
            console.log('👉 Pet changed to:', e.target.value);
            this.currentPet = e.target.value;
            this.drawInitialCanvas();
        });

        this.difficultySelector.addEventListener('change', (e) => {
            console.log('👉 Difficulty changed to:', e.target.value);
            this.currentDifficulty = e.target.value;
            this.simulator.setDifficulty(this.currentDifficulty);
            this.drawInitialCanvas();  // Redraw with new obstacles
        });

        // Modal events
        if (this.closeAboutBtn) {
            this.closeAboutBtn.addEventListener('click', () => this.closeAbout());
        }
    }

    initializeApp() {
        console.log('Initializing: Setting up simulator...');
        this.simulator.setDifficulty(this.currentDifficulty);

        // Draw initial state
        console.log('Initializing: Drawing canvas...');
        this.drawInitialCanvas();

        // Start the game loop
        console.log('Initializing: Starting game loop...');
        this.startGameLoop();

        console.log('✅ Initialization complete!');
    }

    startGameLoop() {
        /**Main game loop - runs every frame*/
        const gameLoop = () => {
            // Update simulator
            this.simulator.update();

            // Draw
            if (this.isRunning || this.simulator.running) {
                this.drawSimulation();
                this.updateStats();

                // Check if simulation ended
                const state = this.simulator.getState();
                if (state.status === 'goal_reached' && this.isRunning) {
                    console.log('✅ Goal reached!');
                    this.successCount++;
                    this.isRunning = false;
                    this.simulator.stop();
                    this.startBtn.disabled = false;
                    this.stopBtn.disabled = true;
                }
            }

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }

    startSimulation() {
        console.log('🚀 startSimulation() called');
        console.log('   isRunning:', this.isRunning);

        if (this.isRunning) {
            console.log('❌ Already running, ignoring start');
            return;
        }

        this.isRunning = true;
        console.log('✅ Set isRunning = true');
        console.log('=== START SIMULATION ===');
        console.log(`Difficulty: ${this.currentDifficulty}, Pet: ${this.currentPet}`);

        // Update button states
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.petSelector.disabled = true;
        this.difficultySelector.disabled = true;
        console.log('✓ Button states updated');

        // Update status
        this.updateStatus('Running...');

        // Start simulator
        this.simulator.start({ difficulty: this.currentDifficulty });
        console.log('🎮 Simulation started!');
    }

    stopSimulation() {
        console.log('⏸️  stopSimulation() called');
        console.log('   isRunning:', this.isRunning);

        if (!this.isRunning) {
            console.log('❌ Not running, ignoring stop');
            return;
        }

        this.isRunning = false;

        // Update button states
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.petSelector.disabled = false;
        this.difficultySelector.disabled = false;
        console.log('✓ Button states updated');

        // Update status
        this.updateStatus('Stopped');

        // Stop simulator
        this.simulator.stop();
        console.log('✅ Simulation stopped');

        // Redraw
        this.drawInitialCanvas();
    }

    resetSimulation() {
        console.log('↻ resetSimulation() called');

        this.isRunning = false;

        // Update button states
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.petSelector.disabled = false;
        this.difficultySelector.disabled = false;

        // Update status
        this.updateStatus('Ready');

        // Reset simulator
        this.simulator.reset();
        console.log('✅ Simulation reset');

        // Redraw
        this.drawInitialCanvas();
    }

    drawInitialCanvas() {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, 800, 600);

        // Grid
        this.ctx.strokeStyle = '#e8e8e8';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x <= 800; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, 600);
            this.ctx.stroke();
        }
        for (let y = 0; y <= 600; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(800, y);
            this.ctx.stroke();
        }

        // Obstacles
        this.drawObstacles();

        // Bowl and Target
        this.drawBowlAndTarget();

        // Robot
        this.drawRobot();
    }

    drawSimulation() {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, 800, 600);

        // Grid
        this.ctx.strokeStyle = '#e8e8e8';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x <= 800; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, 600);
            this.ctx.stroke();
        }
        for (let y = 0; y <= 600; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(800, y);
            this.ctx.stroke();
        }

        // Obstacles
        this.drawObstacles();

        // Bowl and Target
        this.drawBowlAndTarget();

        // Robot
        this.drawRobot();

        // On-canvas stats
        this.drawCanvasStats();
    }

    drawObstacles() {
        const state = this.simulator.getState();
        if (!state.obstacles) return;

        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.strokeStyle = '#E63946';
        this.ctx.lineWidth = 2;

        for (const obs of state.obstacles) {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
    }

    drawBowlAndTarget() {
        const state = this.simulator.getState();
        const target = state.target;

        // Draw premium 3D bowl
        const bowlX = target.x;
        const bowlY = target.y + 8;
        const bowlWidth = 56;
        const bowlHeight = 36;

        // Bowl shadow (ground)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY + bowlHeight + 12, bowlWidth * 0.6, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Bowl base/stand
        this.ctx.fillStyle = '#A0522D';
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY + bowlHeight + 8, bowlWidth * 0.55, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Bowl interior - gradient effect (dark to lighter)
        const gradX = bowlX - bowlWidth * 0.5;
        const gradient = this.ctx.createRadialGradient(bowlX - 8, bowlY + 8, 5, bowlX, bowlY + 12, 35);
        gradient.addColorStop(0, '#E8B88D');  // Lighter inside
        gradient.addColorStop(0.5, '#CD853F'); // Medium brown
        gradient.addColorStop(1, '#8B6914');   // Darker at edges

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY + bowlHeight * 0.7, bowlWidth * 0.5, bowlHeight * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Bowl inner shadow (creates depth)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY + bowlHeight * 0.85, bowlWidth * 0.45, bowlHeight * 0.25, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Bowl rim - outer edge (thick 3D look)
        this.ctx.strokeStyle = '#7A4419';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY, bowlWidth * 0.52, bowlHeight * 0.3, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Bowl rim - main color
        this.ctx.strokeStyle = '#9A6D3D';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY, bowlWidth * 0.5, bowlHeight * 0.28, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Bowl rim highlight (top reflection)
        this.ctx.strokeStyle = '#F4D09F';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY - 3, bowlWidth * 0.48, bowlHeight * 0.22, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Food/water inside bowl
        this.ctx.fillStyle = 'rgba(210, 180, 140, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(bowlX, bowlY + bowlHeight * 0.65, bowlWidth * 0.4, bowlHeight * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Goal star with glow
        this.ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⭐', target.x, target.y - 28);

        // Reset shadow for rest of drawing
        this.ctx.shadowColor = 'transparent';
    }

    drawRobot() {
        const state = this.simulator.getState();

        // Draw subtle sensor lines (very faint)
        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 1;
        for (let angle = -Math.PI / 2; angle <= Math.PI / 2; angle += Math.PI / 4) {
            const sensor_angle = state.robot_angle + angle;
            const end_x = state.robot_x + 80 * Math.cos(sensor_angle);
            const end_y = state.robot_y + 80 * Math.sin(sensor_angle);
            this.ctx.beginPath();
            this.ctx.moveTo(state.robot_x, state.robot_y);
            this.ctx.lineTo(end_x, end_y);
            this.ctx.stroke();
        }

        // Draw direction indicator (small arrow)
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(state.robot_x, state.robot_y);
        const indicator_x = state.robot_x + 12 * Math.cos(state.robot_angle);
        const indicator_y = state.robot_y + 12 * Math.sin(state.robot_angle);
        this.ctx.lineTo(indicator_x, indicator_y);
        this.ctx.stroke();

        // Draw pet emoji - NO ROTATION (faces forward always)
        this.ctx.fillStyle = '#000';  // Ensure full opacity black
        this.ctx.font = 'bold 45px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.globalAlpha = 1.0;  // Force full opacity
        
        // If goal reached, show sitting pose
        if (state.status === 'goal_reached') {
            // Show sitting emoji
            const sittingPets = {
                parrot: '🦜',
                cat: '😺',  // Smiling cat
                dog: '🐶',  // Dog face
                penguin: '🧊', // Popsicle/chilling
                alien: '👽',
                robot_cute: '🤖'
            };
            this.ctx.fillText(sittingPets[this.currentPet] || '🦜', state.robot_x, state.robot_y);
        } else {
            // Normal emoji (not rotated)
            this.ctx.fillText(this.getPetEmoji(), state.robot_x, state.robot_y);
        }
        
        this.ctx.globalAlpha = 1.0;  // Reset opacity
    }

    getPetEmoji() {
        const pets = {
            parrot: '🦜',
            cat: '🐱',
            dog: '🐕',
            penguin: '🐧',
            alien: '👽',
            robot_cute: '🤖'
        };
        return pets[this.currentPet] || '🦜';
    }

    drawCanvasStats() {
        const state = this.simulator.getState();

        // Semi-transparent dark background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(10, 10, 280, 130);

        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(10, 10, 280, 130);

        // Text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        const padding = 18;
        const lineHeight = 22;
        
        this.ctx.fillText(`⏱️  ${state.time.toFixed(1)}s`, padding, 20);
        this.ctx.fillText(`💥 ${state.collisions} collisions`, padding, 20 + lineHeight);
        this.ctx.fillText(`📊 ${this.currentDifficulty}`, padding, 20 + lineHeight * 2);
        
        const successRate = this.successCount > 0 
            ? ((this.successCount / Math.max(1, this.successCount + (this.isRunning ? 1 : 0))) * 100).toFixed(0)
            : '-';
        this.ctx.fillText(`✨ Success: ${successRate}%`, padding, 20 + lineHeight * 3);
        
        this.ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
        this.ctx.fillText(`Status: ${state.status}`, padding, 20 + lineHeight * 4.2);
    }

    updateStatus(status) {
        this.statusEl.textContent = status;
    }

    updateStats() {
        const state = this.simulator.getState();
        this.timeEl.textContent = state.time.toFixed(1) + 's';
        this.collisionsEl.textContent = state.collisions;
        this.statusEl.textContent = state.status || 'idle';

        if (this.successCount > 0) {
            const total = this.successCount + (this.isRunning ? 1 : 0);
            const rate = ((this.successCount / Math.max(1, total)) * 100).toFixed(1);
            this.successRateEl.textContent = rate + '%';
        }
    }

    showAbout() {
        this.aboutModal.style.display = 'block';
    }

    closeAbout() {
        this.aboutModal.style.display = 'none';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM READY ===');
    const app = new PetsyApp();
    window.petsyApp = app;
    console.log('✅ App ready!');
});
