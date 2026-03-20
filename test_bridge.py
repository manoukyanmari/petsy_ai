#!/usr/bin/env python3
"""
Test script for Petsy Bridge - simulates UI interactions
"""

import requests
import time
import json

BASE_URL = "http://localhost:8888"

def test_bridge():
    """Test the bridge API"""
    print("Testing Petsy Bridge...\n")
    
    # Test 1: Reset
    print("1. Testing RESET...")
    try:
        resp = requests.post(f"{BASE_URL}/api/reset", timeout=2)
        print(f"   Status: {resp.status_code}")
        print(f"   Response: {resp.json()}\n")
    except Exception as e:
        print(f"   ERROR: {e}\n")
        return False
    
    # Test 2: Get initial state
    print("2. Getting initial state...")
    try:
        resp = requests.get(f"{BASE_URL}/api/state", timeout=2)
        state = resp.json()
        print(f"   Status: {resp.status_code}")
        print(f"   Robot position: ({state['robot_x']:.1f}, {state['robot_y']:.1f})")
        print(f"   Status: {state['status']}\n")
    except Exception as e:
        print(f"   ERROR: {e}\n")
        return False
    
    # Test 3: Start simulation
    print("3. Starting simulation...")
    try:
        resp = requests.post(f"{BASE_URL}/api/start", json={"pet": "parrot", "difficulty": "normal"}, timeout=10)
        print(f"   Status: {resp.status_code}")
        print(f"   Response: {resp.json()}\n")
    except Exception as e:
        print(f"   ERROR: {e}\n")
        return False
    
    # Test 4: Monitor state changes
    print("4. Monitoring state for 5 seconds...")
    print("   Time | X      | Y      | Angle  | Status")
    print("   -----|--------|--------|--------|----------")
    
    start_time = time.time()
    positions = []
    
    while time.time() - start_time < 5:
        try:
            resp = requests.get(f"{BASE_URL}/api/state", timeout=2)
            state = resp.json()
            elapsed = time.time() - start_time
            print(f"   {elapsed:4.1f}s | {state['robot_x']:6.1f} | {state['robot_y']:6.1f} | {state['robot_angle']:6.1f} | {state['status']}")
            positions.append((state['robot_x'], state['robot_y']))
            time.sleep(0.5)
        except Exception as e:
            print(f"   ERROR: {e}")
            break
    
    print()
    
    # Test 5: Check if robot moved
    if positions:
        movement = sum(abs(positions[i][0] - positions[i-1][0]) + abs(positions[i][1] - positions[i-1][1]) 
                      for i in range(1, len(positions)))
        if movement > 5:
            print(f"✓ Robot MOVED! Total movement: {movement:.1f} pixels")
        else:
            print(f"✗ Robot did NOT move significantly. Total movement: {movement:.1f} pixels")
    
    # Test 6: Stop simulation
    print("\n5. Stopping simulation...")
    try:
        resp = requests.post(f"{BASE_URL}/api/stop", timeout=2)
        print(f"   Status: {resp.status_code}")
        print(f"   Response: {resp.json()}\n")
    except Exception as e:
        print(f"   ERROR: {e}\n")
    
    return True

if __name__ == "__main__":
    try:
        test_bridge()
    except KeyboardInterrupt:
        print("\nTest interrupted")
