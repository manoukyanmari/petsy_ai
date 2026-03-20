#!/usr/bin/env python3
"""Test script for robot movement debugging"""

from simulator import DesktopRobotSimulator, Vector2D
import math

sim = DesktopRobotSimulator()
sim.start_simulation()

# Debug the first update
dt = 0.016
robot = sim.robot
target = sim.target
nav = sim.nav_engine

# Check sensors
print("Obstacles:")
for i, obs in enumerate(sim.obstacles):
    print(f"  {i}: x={obs.x:.1f}, y={obs.y:.1f}, w={obs.width:.1f}, h={obs.height:.1f}")

print(f"\nRobot at ({robot.x}, {robot.y}), Target at ({target.x}, {target.y})")

# Read sensors
robot.read_sensors(sim.obstacles, target)
print(f"\nSensor readings:")
for sensor_id, distance in robot.sensor_readings.items():
    print(f"  Sensor {sensor_id}: {distance:.1f}")

# Check obstacle avoidance
avoid = nav.check_obstacle_avoidance()
print(f"\nObstacle avoidance needed? {avoid is not None}")
if avoid:
    print(f"  Avoid direction: {avoid}")

# Now do the actual update
print("\n--- Running actual update ---")
sim._update_simulation()
print(f"Position after update: ({robot.x:.2f}, {robot.y:.2f})")
print(f"Motors set to: left={robot.left_motor:.3f}, right={robot.right_motor:.3f}")
print(f"Movement delta: dx={(robot.x-100):.2f}, dy={(robot.y-100):.2f}")

