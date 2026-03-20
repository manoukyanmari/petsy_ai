"""
Petsy Bridge - MVP Only: Autonomous Navigation + Visualization
"""

import json
import sys
import os
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread
import time

# Configure pygame for headless operation (no display window)
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from simulator import DesktopRobotSimulator
except Exception as e:
    print(f"ERROR: Failed to import simulator: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# State
sim = None
running = False
state = {
    'time': 0.0,
    'collisions': 0,
    'robot_x': 100,
    'robot_y': 100,
    'robot_angle': 0,
    'status': 'ready',
    'success': False
}

def loop():
    global sim, state, running
    print("Simulation loop started")
    while True:
        if running and sim:
            try:
                # Update simulation only if active
                if sim.simulation_active:
                    sim._update_simulation()
                    
                # Always sync state from simulator
                state['time'] = sim.elapsed_time
                state['robot_x'] = sim.robot.x
                state['robot_y'] = sim.robot.y
                state['robot_angle'] = sim.robot.angle
                state['collisions'] = sim.collision_count
                
                # Check if goal reached
                if hasattr(sim, 'nav_engine') and sim.nav_engine.reached_target():
                    state['success'] = True
                    state['status'] = 'goal_reached'
                    running = False
                else:
                    state['status'] = 'running'
                
                print(f"Frame: x={state['robot_x']:.1f}, y={state['robot_y']:.1f}, angle={state['robot_angle']:.1f}")
            except Exception as e:
                print(f"Loop error: {e}")
                import traceback
                traceback.print_exc()
        time.sleep(0.016)

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/state':
            print(f"GET /api/state - returning: {state}")
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(state).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        global sim, running, state
        
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode() if length else ''
        
        print(f"POST {self.path}")
        
        if self.path == '/api/start':
            print("START called")
            try:
                if not sim:
                    print("Creating simulator...")
                    sim = DesktopRobotSimulator()
                    print("Simulator created!")
                # Start the simulation
                sim.start_simulation()
                running = True
                state['status'] = 'running'
                state['time'] = 0.0
                state['collisions'] = 0
                resp = {'ok': True}
                print("Start OK")
            except Exception as e:
                print(f"START ERROR: {e}")
                import traceback
                traceback.print_exc()
                resp = {'ok': False, 'error': str(e)}
        
        elif self.path == '/api/stop':
            print("STOP called")
            if sim:
                sim.stop_simulation()
            running = False
            state['status'] = 'stopped'
            resp = {'ok': True}
        
        elif self.path == '/api/reset':
            print("RESET called")
            if sim:
                try:
                    sim.reset_simulation()
                except Exception as e:
                    print(f"Reset error: {e}")
            state['time'] = 0.0
            state['collisions'] = 0
            state['robot_x'] = 100
            state['robot_y'] = 100
            state['robot_angle'] = 0
            state['status'] = 'ready'
            state['success'] = False
            resp = {'ok': True}
        
        elif self.path == '/api/set-difficulty':
            print("SET-DIFFICULTY called")
            try:
                data = json.loads(body) if body else {}
                difficulty = data.get('difficulty', 'normal')
                if not sim:
                    sim = DesktopRobotSimulator()
                sim.set_difficulty(difficulty)
                resp = {'ok': True}
            except Exception as e:
                print(f"SET-DIFFICULTY ERROR: {e}")
                resp = {'ok': False, 'error': str(e)}
        
        elif self.path == '/api/get-obstacles':
            print("GET-OBSTACLES called")
            try:
                if not sim:
                    sim = DesktopRobotSimulator()
                obstacles = [{'x': o.x, 'y': o.y, 'width': o.width, 'height': o.height} for o in sim.obstacles]
                target = {'x': sim.target.x, 'y': sim.target.y}
                resp = {'ok': True, 'obstacles': obstacles, 'target': target}
            except Exception as e:
                print(f"GET-OBSTACLES ERROR: {e}")
                resp = {'ok': False, 'error': str(e)}
        
        else:
            resp = {'ok': False}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(resp).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST')
        self.end_headers()

    def log_message(self, *args):
        pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8888
    print("Starting bridge...")
    Thread(target=loop, daemon=True).start()
    try:
        HTTPServer(('localhost', port), Handler).serve_forever()
    except Exception as e:
        print(f"Bridge error: {e}")

