"""
Petsy Desktop Robot Simulator
Core simulation engine with autonomous navigation and obstacle avoidance
"""

import math
import time
from dataclasses import dataclass
from typing import List, Tuple
import random

# ==================== DATA STRUCTURES ====================

@dataclass
class Vector2D:
    """2D Vector with basic operations"""
    x: float
    y: float
    
    def distance_to(self, other: 'Vector2D') -> float:
        """Calculate distance to another vector"""
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)
    
    def angle_to(self, other: 'Vector2D') -> float:
        """Calculate angle to another vector in radians"""
        dx = other.x - self.x
        dy = other.y - self.y
        return math.atan2(dy, dx)
    
    def __add__(self, other: 'Vector2D') -> 'Vector2D':
        return Vector2D(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other: 'Vector2D') -> 'Vector2D':
        return Vector2D(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar: float) -> 'Vector2D':
        return Vector2D(self.x * scalar, self.y * scalar)
    
    def magnitude(self) -> float:
        return math.sqrt(self.x**2 + self.y**2)
    
    def normalize(self) -> 'Vector2D':
        mag = self.magnitude()
        if mag == 0:
            return Vector2D(0, 0)
        return Vector2D(self.x / mag, self.y / mag)


# ==================== ROBOT AND SENSORS ====================

class Robot:
    """Represents the simulated robot"""
    def __init__(self, x: float, y: float, angle: float = 0, speed: float = 100):
        self.x = x
        self.y = y
        self.angle = angle  # in radians, 0 = facing right
        self.speed = speed  # pixels per second
        self.radius = 15  # collision radius
        
        # Motor speeds (0-1, where 1 is max forward, -1 is max backward)
        self.left_motor = 0.0
        self.right_motor = 0.0
        
        # Sensor readings
        self.sensor_readings = {}  # angle -> distance
        
    def move(self, dt: float):
        """Update robot position based on motor speeds"""
        if self.left_motor == self.right_motor:
            # Both motors same speed: move straight
            velocity = self.speed * self.left_motor
            self.x += math.cos(self.angle) * velocity * dt
            self.y += math.sin(self.angle) * velocity * dt
        else:
            # Different motor speeds: rotate and move (differential drive)
            # Simplified model: average velocity and angular velocity
            avg_velocity = self.speed * (self.left_motor + self.right_motor) / 2
            angular_velocity = (self.right_motor - self.left_motor) * 2 * math.pi
            
            self.x += math.cos(self.angle) * avg_velocity * dt
            self.y += math.sin(self.angle) * avg_velocity * dt
            self.angle += angular_velocity * dt
            
            # Normalize angle to [-pi, pi]
            while self.angle > math.pi:
                self.angle -= 2 * math.pi
            while self.angle < -math.pi:
                self.angle += 2 * math.pi

    def read_sensors(self, obstacles: List['Obstacle'], target: Vector2D = None):
        """Simulate distance sensor readings"""
        sensor_angles = [
            self.angle - math.pi/4,      # Front-left
            self.angle,                   # Front-center
            self.angle + math.pi/4,      # Front-right
            self.angle + math.pi/2,      # Right
            self.angle - math.pi/2,      # Left
        ]
        
        self.sensor_readings = {}
        robot_pos = Vector2D(self.x, self.y)
        
        for i, sensor_angle in enumerate(sensor_angles):
            # Cast a ray and find nearest obstacle
            max_distance = 150
            min_distance = max_distance
            
            for step in range(0, int(max_distance), 5):
                ray_x = self.x + math.cos(sensor_angle) * step
                ray_y = self.y + math.sin(sensor_angle) * step
                ray_pos = Vector2D(ray_x, ray_y)
                
                # Check collision with obstacles
                for obstacle in obstacles:
                    if obstacle.collides_with_point(ray_pos):
                        min_distance = min(min_distance, step)
                        break
            
            self.sensor_readings[i] = min_distance


# ==================== OBSTACLES ====================

class Obstacle:
    """Represents an obstacle in the environment"""
    def __init__(self, x: float, y: float, width: float, height: float):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        
    def collides_with_point(self, point: Vector2D, padding: float = 0) -> bool:
        """Check if point collides with obstacle (with padding)"""
        return (self.x - padding <= point.x <= self.x + self.width + padding and
                self.y - padding <= point.y <= self.y + self.height + padding)
    
    def collides_with_circle(self, center: Vector2D, radius: float) -> bool:
        """Check if circle collides with rectangular obstacle"""
        # Find closest point on rectangle to circle center
        closest_x = max(self.x, min(center.x, self.x + self.width))
        closest_y = max(self.y, min(center.y, self.y + self.height))
        
        # Check if distance to closest point is within radius
        distance = math.sqrt((center.x - closest_x)**2 + (center.y - closest_y)**2)
        return distance < radius


# ==================== NAVIGATION ENGINE ====================

class NavigationEngine:
    """Handles autonomous navigation and obstacle avoidance"""
    def __init__(self, robot: Robot, target: Vector2D, obstacles: List[Obstacle]):
        self.robot = robot
        self.target = target
        self.obstacles = obstacles
        
        # PID controller parameters for heading (reduced from 0.5 to be less aggressive)
        self.kp_heading = 0.2  # Reduced for smoother control
        self.ki_heading = 0.05
        self.kd_heading = 0.15
        self.heading_error_integral = 0.0
        self.last_heading_error = 0.0
        
        # Obstacle avoidance parameters
        self.collision_avoid_distance = 80  # Distance threshold for obstacle
        self.danger_distance = 40  # Critical collision distance
        
    def update(self, dt: float):
        """Update robot motors based on navigation logic"""
        robot_pos = Vector2D(self.robot.x, self.robot.y)
        
        # 1. Read sensors
        self.robot.read_sensors(self.obstacles, self.target)
        
        # 2. Check for obstacles ahead
        avoid_direction = self.check_obstacle_avoidance()
        
        if avoid_direction is not None:
            # Obstacle detected: avoid it
            self.robot.left_motor = avoid_direction['left']
            self.robot.right_motor = avoid_direction['right']
        else:
            # No immediate obstacle: navigate to target
            self.navigate_to_target(dt)
        
        # 3. Move the robot
        self.robot.move(dt)
    
    def check_obstacle_avoidance(self) -> dict:
        """Check sensors and determine if obstacle avoidance is needed"""
        if not self.robot.sensor_readings:
            return None
        
        # Sensor indices: 0=Front-left, 1=Front-center, 2=Front-right, 3=Right, 4=Left
        front_sensors = [
            self.robot.sensor_readings.get(0, 200),  # Front-left
            self.robot.sensor_readings.get(1, 200),  # Front-center
            self.robot.sensor_readings.get(2, 200),  # Front-right
        ]
        
        min_front_distance = min(front_sensors)
        
        # If obstacle is dangerously close, take evasive action
        if min_front_distance < self.danger_distance:
            # Stop or reverse
            return {'left': -0.5, 'right': -0.5}
        
        # If obstacle is close but not critical, turn away from it
        if min_front_distance < self.collision_avoid_distance:
            # Determine which side is clearer
            left_distance = self.robot.sensor_readings.get(4, 200)  # Left
            right_distance = self.robot.sensor_readings.get(3, 200)  # Right
            
            if right_distance > left_distance:
                # Turn right
                return {'left': 0.6, 'right': 0.1}
            else:
                # Turn left
                return {'left': 0.1, 'right': 0.6}
        
        return None
    
    def navigate_to_target(self, dt: float):
        """Use PID controller to navigate to target"""
        robot_pos = Vector2D(self.robot.x, self.robot.y)
        
        # Calculate desired heading to target
        distance_to_target = robot_pos.distance_to(self.target)
        desired_angle = robot_pos.angle_to(self.target)
        
        # Calculate heading error
        heading_error = desired_angle - self.robot.angle
        
        # Normalize heading error to [-pi, pi]
        while heading_error > math.pi:
            heading_error -= 2 * math.pi
        while heading_error < -math.pi:
            heading_error += 2 * math.pi
        
        # PID control
        self.heading_error_integral += heading_error * dt
        heading_derivative = (heading_error - self.last_heading_error) / dt if dt > 0 else 0
        self.last_heading_error = heading_error
        
        pid_output = (self.kp_heading * heading_error + 
                     self.ki_heading * self.heading_error_integral + 
                     self.kd_heading * heading_derivative)
        
        # Convert PID output to motor commands (clamp to prevent extreme values)
        base_speed = 0.8 if distance_to_target > 30 else 0.4
        
        # Clamp PID output to reasonable values
        pid_output = max(-0.5, min(0.5, pid_output))
        
        self.robot.left_motor = max(-1, min(1, base_speed - pid_output))
        self.robot.right_motor = max(-1, min(1, base_speed + pid_output))
    
    def reached_target(self, threshold: float = 20) -> bool:
        """Check if robot has reached the target"""
        robot_pos = Vector2D(self.robot.x, self.robot.y)
        return robot_pos.distance_to(self.target) < threshold


# ==================== MAIN SIMULATOR ====================

class DesktopRobotSimulator:
    """Main simulation class"""
    def __init__(self, width: float = 800, height: float = 600):
        self.width = width
        self.height = height
        
        # Robot
        self.robot = Robot(100, 100, angle=0)
        
        # Target (goal)
        self.target = Vector2D(700, 500)
        
        # Obstacles
        self.obstacles = []
        self._generate_obstacles(difficulty='normal')
        
        # Navigation engine
        self.nav_engine = NavigationEngine(self.robot, self.target, self.obstacles)
        
        # State tracking
        self.simulation_active = False
        self.start_time = None
        self.elapsed_time = 0.0
        self.collision_count = 0
        self.last_collision_check = time.time()
        
        # Performance tracking
        self.max_collisions = 10  # Threshold for failure
        
    def _generate_obstacles(self, difficulty: str = 'normal'):
        """Generate obstacles based on difficulty level"""
        self.obstacles = []
        
        difficulty_map = {
            'easy': 3,
            'normal': 7,
            'hard': 12,
            'expert': 15
        }
        
        num_obstacles = difficulty_map.get(difficulty, 7)
        
        # Create obstacles with random positions (avoiding start and goal areas)
        random.seed(42)  # For reproducibility
        for i in range(num_obstacles):
            while True:
                x = random.uniform(150, self.width - 100)
                y = random.uniform(150, self.height - 100)
                
                # Avoid start area
                if Vector2D(x, y).distance_to(Vector2D(100, 100)) < 80:
                    continue
                # Avoid goal area
                if Vector2D(x, y).distance_to(self.target) < 80:
                    continue
                
                break
            
            width = random.uniform(30, 60)
            height = random.uniform(30, 60)
            self.obstacles.append(Obstacle(x, y, width, height))
    
    def start_simulation(self):
        """Start the simulation"""
        if not self.simulation_active:
            self.simulation_active = True
            self.start_time = time.time()
            self.elapsed_time = 0.0
            self.collision_count = 0
            self.robot.x = 100
            self.robot.y = 100
            self.robot.angle = 0
            self.nav_engine.heading_error_integral = 0.0
            print(f"Simulation started. Target at ({self.target.x}, {self.target.y})")
    
    def stop_simulation(self):
        """Stop the simulation"""
        self.simulation_active = False
        print("Simulation stopped")
    
    def reset_simulation(self):
        """Reset the simulation"""
        self.simulation_active = False
        self.start_time = None
        self.elapsed_time = 0.0
        self.collision_count = 0
        self.robot.x = 100
        self.robot.y = 100
        self.robot.angle = 0
        self.robot.left_motor = 0
        self.robot.right_motor = 0
        self.nav_engine.heading_error_integral = 0.0
        print("Simulation reset")
    
    def set_difficulty(self, difficulty: str):
        """Set difficulty and regenerate obstacles"""
        self._generate_obstacles(difficulty)
        print(f"Difficulty set to {difficulty}, {len(self.obstacles)} obstacles generated")
    
    def _update_simulation(self):
        """Update simulation state (called at each frame)"""
        if not self.simulation_active:
            return
        
        # Update elapsed time
        current_time = time.time()
        if self.start_time is None:
            self.start_time = current_time
        self.elapsed_time = current_time - self.start_time
        
        # Fixed timestep for physics
        dt = 0.016  # ~60 FPS
        
        # Update navigation
        self.nav_engine.update(dt)
        
        # Check for collisions
        robot_pos = Vector2D(self.robot.x, self.robot.y)
        for obstacle in self.obstacles:
            if obstacle.collides_with_circle(robot_pos, self.robot.radius):
                # Check if we haven't already counted this collision
                current_time = time.time()
                if current_time - self.last_collision_check > 0.2:  # Only count once per 0.2s
                    self.collision_count += 1
                    self.last_collision_check = current_time
                    print(f"Collision detected! Total: {self.collision_count}")
        
        # Boundary collision check
        if (self.robot.x - self.robot.radius < 0 or 
            self.robot.x + self.robot.radius > self.width or
            self.robot.y - self.robot.radius < 0 or 
            self.robot.y + self.robot.radius > self.height):
            
            current_time = time.time()
            if current_time - self.last_collision_check > 0.2:
                self.collision_count += 1
                self.last_collision_check = current_time
                print("Boundary collision detected!")
        
        # Check if target reached
        if self.nav_engine.reached_target():
            print("✓ Target reached!")
            self.simulation_active = False
        
        # Check for failure conditions
        if self.collision_count > self.max_collisions or self.elapsed_time > 30:
            if self.collision_count > self.max_collisions:
                print("✗ Too many collisions!")
            else:
                print("✗ Time limit exceeded!")
            self.simulation_active = False
    
    def get_state(self) -> dict:
        """Get current simulation state"""
        return {
            'time': self.elapsed_time,
            'collisions': self.collision_count,
            'robot_x': self.robot.x,
            'robot_y': self.robot.y,
            'robot_angle': self.robot.angle,
            'status': 'running' if self.simulation_active else 'idle',
            'success': self.nav_engine.reached_target() if hasattr(self, 'start_time') and self.start_time else False,
            'obstacles': [{'x': o.x, 'y': o.y, 'width': o.width, 'height': o.height} for o in self.obstacles],
            'target': {'x': self.target.x, 'y': self.target.y}
        }


# ==================== TESTING ====================

if __name__ == '__main__':
    print("Starting simulator test...")
    sim = DesktopRobotSimulator()
    sim.start_simulation()
    
    for i in range(100):
        sim._update_simulation()
        state = sim.get_state()
        print(f"Frame {i}: x={state['robot_x']:.1f}, y={state['robot_y']:.1f}, collisions={state['collisions']}")
        time.sleep(0.016)
    
    print("Test complete")
