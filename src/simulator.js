/**
 * Petsy JavaScript Simulator
 * Port of Python simulator.py to pure JavaScript
 * No external dependencies needed - runs directly in Electron
 */

class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalized() {
        const len = this.length();
        if (len === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / len, this.y / len);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    copy() {
        return new Vector2D(this.x, this.y);
    }
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    toDict() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Robot {
    constructor(x = 100, y = 100, size = 16) {
        this.position = new Vector2D(x, y);
        this.angle = 0;
        this.size = size;  // Slightly larger for better collision detection
        this.left_motor = 0;
        this.right_motor = 0;
        this.max_speed = 100; // pixels per second
    }

    move(dt) {
        // Differential drive model
        // left and right motor values are -1 to 1
        const left_speed = this.left_motor * this.max_speed;
        const right_speed = this.right_motor * this.max_speed;

        // Calculate linear and angular velocities
        const linear_velocity = (left_speed + right_speed) / 2;
        const wheelbase = 20; // Distance between wheels
        const angular_velocity = (right_speed - left_speed) / wheelbase;

        // Update angle
        this.angle += angular_velocity * dt;
        this.angle = this.normalizeAngle(this.angle);

        // Update position
        const dx = linear_velocity * Math.cos(this.angle) * dt;
        const dy = linear_velocity * Math.sin(this.angle) * dt;

        this.position.x += dx;
        this.position.y += dy;

        // Clamp to canvas boundaries with large margin for emoji (800x600)
        const margin = 35;  // Large margin to keep emoji fully visible
        this.position.x = Math.max(margin, Math.min(800 - margin, this.position.x));
        this.position.y = Math.max(margin, Math.min(600 - margin, this.position.y));
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    toDict() {
        return {
            x: this.position.x,
            y: this.position.y,
            angle: this.angle,
            size: this.size
        };
    }
}

class PathFinder {
    constructor(canvas_width = 800, canvas_height = 600, cell_size = 20) {
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.cell_size = cell_size;
        this.cols = Math.ceil(canvas_width / cell_size);
        this.rows = Math.ceil(canvas_height / cell_size);
    }

    // Convert pixel position to grid cell
    posToCell(pos) {
        return {
            col: Math.floor(pos.x / this.cell_size),
            row: Math.floor(pos.y / this.cell_size)
        };
    }

    // Convert grid cell to pixel position (center of cell)
    cellToPos(col, row) {
        return new Vector2D(
            col * this.cell_size + this.cell_size / 2,
            row * this.cell_size + this.cell_size / 2
        );
    }

    // Check if cell is walkable (not blocked by obstacle or boundary)
    isWalkable(col, row, obstacles, robot_size) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;

        const cell_pos = this.cellToPos(col, row);
        const margin = robot_size + 10; // Safety margin

        // Check boundaries
        if (cell_pos.x - this.cell_size / 2 < margin || 
            cell_pos.x + this.cell_size / 2 > this.canvas_width - margin ||
            cell_pos.y - this.cell_size / 2 < margin || 
            cell_pos.y + this.cell_size / 2 > this.canvas_height - margin) {
            return false;
        }

        // Check obstacles (with buffer)
        for (const obs of obstacles) {
            if (this.cellIntersectsObstacle(col, row, obs, robot_size)) {
                return false;
            }
        }
        return true;
    }

    cellIntersectsObstacle(col, row, obstacle, robot_size) {
        const cell_center = this.cellToPos(col, row);
        const buffer = robot_size + 5;
        
        const closest_x = Math.max(obstacle.x - buffer, Math.min(cell_center.x, obstacle.x + obstacle.width + buffer));
        const closest_y = Math.max(obstacle.y - buffer, Math.min(cell_center.y, obstacle.y + obstacle.height + buffer));

        const dx = cell_center.x - closest_x;
        const dy = cell_center.y - closest_y;
        return (dx * dx + dy * dy) < (this.cell_size / 2) * (this.cell_size / 2);
    }

    // Dijkstra's shortest path algorithm
    findPath(start_pos, end_pos, obstacles, robot_size) {
        const start = this.posToCell(start_pos);
        const end = this.posToCell(end_pos);

        if (!this.isWalkable(start.col, start.row, obstacles, robot_size) ||
            !this.isWalkable(end.col, end.row, obstacles, robot_size)) {
            return []; // Can't reach
        }

        const open_set = new Map();
        const closed_set = new Set();
        const distances = new Map();
        const parents = new Map();

        const key = (col, row) => `${col},${row}`;
        const start_key = key(start.col, start.row);
        const end_key = key(end.col, end.row);

        open_set.set(start_key, 0);
        distances.set(start_key, 0);

        while (open_set.size > 0) {
            // Find node with smallest distance
            let current_key = null;
            let min_dist = Infinity;
            for (const [k, dist] of open_set) {
                if (dist < min_dist) {
                    min_dist = dist;
                    current_key = k;
                }
            }

            if (current_key === end_key) {
                // Reconstruct path
                const path = [];
                let k = end_key;
                while (k !== undefined) {
                    const [col, row] = k.split(',').map(Number);
                    path.unshift(this.cellToPos(col, row));
                    k = parents.get(k);
                }
                return path;
            }

            open_set.delete(current_key);
            closed_set.add(current_key);

            const [col, row] = current_key.split(',').map(Number);
            const current_dist = distances.get(current_key);

            // Check 8 neighbors
            for (let dc = -1; dc <= 1; dc++) {
                for (let dr = -1; dr <= 1; dr++) {
                    if (dc === 0 && dr === 0) continue;

                    const neighbor_col = col + dc;
                    const neighbor_row = row + dr;
                    const neighbor_key = key(neighbor_col, neighbor_row);

                    if (closed_set.has(neighbor_key)) continue;
                    if (!this.isWalkable(neighbor_col, neighbor_row, obstacles, robot_size)) continue;

                    const diagonal = dc !== 0 && dr !== 0;
                    const step_distance = diagonal ? 1.414 : 1; // sqrt(2) for diagonals
                    const new_dist = current_dist + step_distance;

                    if (!distances.has(neighbor_key) || new_dist < distances.get(neighbor_key)) {
                        distances.set(neighbor_key, new_dist);
                        open_set.set(neighbor_key, new_dist);
                        parents.set(neighbor_key, current_key);
                    }
                }
            }
        }

        return []; // No path found
    }
}

class NavigationEngine {
    constructor(robot, obstacles = []) {
        this.robot = robot;
        this.obstacles = obstacles;
        this.target = new Vector2D(700, 500);

        // Pathfinding
        this.pathfinder = new PathFinder(800, 600, 25);
        this.path = [];
        this.current_waypoint_index = 0;
        this.waypoint_threshold = 30; // Distance to switch to next waypoint
        this.last_path_time = 0;
        this.replan_interval = 1.0; // Replan every 1 second

        // PID controller state
        this.heading_error_integral = 0;
        this.last_heading_error = 0;

        // PID gains
        this.kp_heading = 0.2;
        this.ki_heading = 0.05;
        this.kd_heading = 0.15;

        // Obstacle avoidance parameters
        this.danger_distance = 50;  // Balanced value
        this.collision_avoid_distance = 90;  // Balanced value
        this.sensor_range = 150;

        // Collision tracking
        this.last_collision_time = 0;
        this.collision_debounce = 0.2; // seconds
        this.collision_count = 0;

        this.success = false;
    }

    getSensorReadings() {
        // Simulate 5 distance sensors
        const sensors = {};
        const sensor_angles = {
            'front_center': 0,
            'front_left': Math.PI / 4,
            'front_right': -Math.PI / 4,
            'left': Math.PI / 2,
            'right': -Math.PI / 2
        };

        for (const [name, angle_offset] of Object.entries(sensor_angles)) {
            const sensor_angle = this.robot.angle + angle_offset;
            const direction = new Vector2D(Math.cos(sensor_angle), Math.sin(sensor_angle));
            const sensor_end = this.robot.position.add(direction.multiply(this.sensor_range));

            let min_distance = this.sensor_range;

            // Check distance to each obstacle
            for (const obstacle of this.obstacles) {
                const distance = this.distanceToObstacle(this.robot.position, sensor_end, obstacle);
                if (distance < min_distance) {
                    min_distance = distance;
                }
            }

            // Check distance to canvas boundaries
            const boundary_distance = this.distanceToBoundary(this.robot.position, sensor_angle);
            if (boundary_distance < min_distance) {
                min_distance = boundary_distance;
            }

            sensors[name] = min_distance;
        }

        return sensors;
    }

    distanceToObstacle(start, end, obstacle) {
        // Distance from line segment to rectangle
        const closest = this.closestPointOnSegmentToRect(start, end, obstacle);
        return start.subtract(closest).length();
    }

    closestPointOnSegmentToRect(start, end, obstacle) {
        // Simplified: return point on segment closest to obstacle center
        const rect_center = new Vector2D(
            obstacle.x + obstacle.width / 2,
            obstacle.y + obstacle.height / 2
        );

        const t = Math.max(0, Math.min(1, this.projectPoint(start, end, rect_center)));
        return start.add(end.subtract(start).multiply(t));
    }

    projectPoint(start, end, point) {
        const segment = end.subtract(start);
        const to_point = point.subtract(start);
        const dot = to_point.dot(segment);
        const len_sq = segment.dot(segment);
        return len_sq === 0 ? 0 : dot / len_sq;
    }

    distanceToBoundary(position, angle) {
        const direction = new Vector2D(Math.cos(angle), Math.sin(angle));
        let min_distance = this.sensor_range;

        // Check all 4 boundaries
        const boundaries = [
            { x: 0, side: 'left' },
            { x: 800, side: 'right' },
            { y: 0, side: 'top' },
            { y: 600, side: 'bottom' }
        ];

        for (const boundary of boundaries) {
            let distance = this.sensor_range;
            if (boundary.side === 'left' || boundary.side === 'right') {
                if (Math.abs(direction.x) > 0.01) {
                    distance = Math.abs((boundary.x - position.x) / direction.x);
                }
            } else {
                if (Math.abs(direction.y) > 0.01) {
                    distance = Math.abs((boundary.y - position.y) / direction.y);
                }
            }
            if (distance > 0 && distance < min_distance) {
                min_distance = distance;
            }
        }

        return min_distance;
    }

    checkObstacleAvoidance() {
        const sensors = this.getSensorReadings();

        // Balanced obstacle avoidance
        let avoidance_steering = 0;

        if (sensors.front_center < this.collision_avoid_distance) {
            // Obstacle in front - turn away
            if (sensors.left > sensors.right) {
                avoidance_steering = -0.6; // Turn left
            } else {
                avoidance_steering = 0.6; // Turn right
            }
        } else if (sensors.front_left < this.danger_distance) {
            avoidance_steering = -0.35; // Turn left
        } else if (sensors.front_right < this.danger_distance) {
            avoidance_steering = 0.35; // Turn right
        }

        return avoidance_steering;
    }

    computePath() {
        this.path = this.pathfinder.findPath(this.robot.position, this.target, this.obstacles, this.robot.size);
        this.current_waypoint_index = 0;
        this.last_path_time = Date.now() / 1000;
    }

    getCurrentWaypoint() {
        if (this.path.length === 0) return this.target;
        if (this.current_waypoint_index >= this.path.length) return this.target;
        return this.path[this.current_waypoint_index];
    }

    updateWaypoint() {
        if (this.path.length === 0) return;

        const current_waypoint = this.getCurrentWaypoint();
        const distance_to_waypoint = this.robot.position.subtract(current_waypoint).length();

        if (distance_to_waypoint < this.waypoint_threshold) {
            this.current_waypoint_index++;
            if (this.current_waypoint_index >= this.path.length) {
                // Reached end of path, now target the actual goal
                this.current_waypoint_index = this.path.length - 1;
            }
        }
    }

    navigateToTarget(dt) {
        // Stop if goal is reached
        if (this.success) {
            this.robot.left_motor = 0;
            this.robot.right_motor = 0;
            return;
        }

        // Recompute path periodically or if no path exists
        const now = Date.now() / 1000;
        if (this.path.length === 0 || (now - this.last_path_time > this.replan_interval)) {
            this.computePath();
        }

        // Update waypoint if we reached it
        this.updateWaypoint();

        // Get current target (waypoint or final target)
        let current_target = this.target;
        if (this.path.length > 0) {
            current_target = this.getCurrentWaypoint();
        }

        // Calculate direction to current target
        const direction_to_target = current_target.subtract(this.robot.position).normalized();
        const target_angle = Math.atan2(direction_to_target.y, direction_to_target.x);

        // PID controller for heading
        let heading_error = target_angle - this.robot.angle;

        // Normalize error to [-π, π]
        while (heading_error > Math.PI) heading_error -= 2 * Math.PI;
        while (heading_error < -Math.PI) heading_error += 2 * Math.PI;

        // PID calculation
        this.heading_error_integral += heading_error * dt;
        this.heading_error_integral = Math.max(-1, Math.min(1, this.heading_error_integral));

        const heading_derivative = (heading_error - this.last_heading_error) / dt;
        this.last_heading_error = heading_error;

        let pid_output =
            this.kp_heading * heading_error +
            this.ki_heading * this.heading_error_integral +
            this.kd_heading * heading_derivative;

        // Clamp PID output
        pid_output = Math.max(-0.5, Math.min(0.5, pid_output));

        // Get obstacle avoidance steering
        const avoid_steering = this.checkObstacleAvoidance();

        // Balance: navigation 65%, avoidance 35%
        const steering = 0.65 * pid_output + 0.35 * avoid_steering;

        // Differential drive - normal speed
        const forward_speed = 0.8;
        this.robot.left_motor = forward_speed - steering;
        this.robot.right_motor = forward_speed + steering;

        // Clamp motor values
        this.robot.left_motor = Math.max(-1, Math.min(1, this.robot.left_motor));
        this.robot.right_motor = Math.max(-1, Math.min(1, this.robot.right_motor));
    }

    checkCollision() {
        const now = Date.now() / 1000; // Convert to seconds
        if (now - this.last_collision_time < this.collision_debounce) {
            return;
        }

        for (const obstacle of this.obstacles) {
            if (this.circleRectangleCollision(this.robot.position, this.robot.size, obstacle)) {
                this.collision_count++;
                this.last_collision_time = now;
                break; // Only count one collision per frame
            }
        }
    }

    circleRectangleCollision(circle_pos, radius, rect) {
        // Find closest point on rectangle to circle center
        const closest_x = Math.max(rect.x, Math.min(circle_pos.x, rect.x + rect.width));
        const closest_y = Math.max(rect.y, Math.min(circle_pos.y, rect.y + rect.height));

        // Calculate distance
        const dx = circle_pos.x - closest_x;
        const dy = circle_pos.y - closest_y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Small buffer for collision detection
        return distance < radius + 3;
    }

    checkSuccess() {
        const distance_to_target = this.robot.position.subtract(this.target).length();
        if (distance_to_target < 50) {
            this.success = true;
            return true;
        }
        return false;
    }

    update(dt) {
        if (dt > 0.1) dt = 0.1; // Max 100ms per frame
        if (dt < 0.001) return; // Skip very small timesteps

        // Check success FIRST before navigation
        this.checkSuccess();

        // Navigation (will stop if success)
        this.navigateToTarget(dt);

        // Physics
        this.robot.move(dt);

        // Collision detection
        this.checkCollision();
    }

    setObstacles(obstacles) {
        this.obstacles = obstacles;
    }

    setState(state) {
        if (state.robot_x !== undefined) this.robot.position.x = state.robot_x;
        if (state.robot_y !== undefined) this.robot.position.y = state.robot_y;
        if (state.robot_angle !== undefined) this.robot.angle = state.robot_angle;
        if (state.collisions !== undefined) this.collision_count = state.collisions;
        if (state.success !== undefined) this.success = state.success;
    }

    getState() {
        return {
            robot_x: this.robot.position.x,
            robot_y: this.robot.position.y,
            robot_angle: this.robot.angle,
            collisions: this.collision_count,
            success: this.success,
            target: { x: this.target.x, y: this.target.y }
        };
    }
}

class Simulator {
    constructor() {
        this.robot = new Robot(100, 100);
        this.obstacles = [];
        this.engine = new NavigationEngine(this.robot, this.obstacles);
        this.running = false;
        this.time = 0;
        this.last_update = 0;
        this.difficulty = 'normal';
    }

    generateObstacles(difficulty) {
        const difficulty_map = {
            easy: 3,
            normal: 7,
            hard: 12,
            expert: 15
        };

        const count = difficulty_map[difficulty] || 7;
        this.obstacles = [];

        const positions = [
            { x: 200, y: 150, w: 40, h: 40 },
            { x: 300, y: 250, w: 50, h: 30 },
            { x: 150, y: 400, w: 60, h: 40 },
            { x: 450, y: 300, w: 35, h: 45 },
            { x: 550, y: 150, w: 40, h: 40 },
            { x: 400, y: 500, w: 50, h: 30 },
            { x: 600, y: 450, w: 45, h: 35 },
            { x: 250, y: 500, w: 40, h: 50 },
            { x: 500, y: 100, w: 50, h: 40 },
            { x: 350, y: 350, w: 45, h: 45 },
            { x: 600, y: 250, w: 40, h: 50 },
            { x: 100, y: 300, w: 50, h: 30 },
            { x: 700, y: 300, w: 40, h: 40 },
            { x: 200, y: 50, w: 60, h: 30 },
            { x: 550, y: 450, w: 35, h: 45 }
        ];

        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const p = positions[i];
            this.obstacles.push(new Obstacle(p.x, p.y, p.w, p.h));
        }

        this.engine.setObstacles(this.obstacles);
    }

    start(config = {}) {
        this.difficulty = config.difficulty || 'normal';
        this.generateObstacles(this.difficulty);
        this.running = true;
        this.time = 0;
        this.robot = new Robot(100, 100);
        this.engine = new NavigationEngine(this.robot, this.obstacles);
        this.engine.computePath(); // Compute initial path
        this.last_update = Date.now() / 1000;
    }

    stop() {
        this.running = false;
    }

    reset() {
        this.running = false;
        this.time = 0;
        this.robot = new Robot(100, 100);
        this.engine = new NavigationEngine(this.robot, this.obstacles);
    }

    update() {
        if (!this.running) return;

        const now = Date.now() / 1000;
        const dt = Math.min(0.016, now - this.last_update); // 60 FPS cap
        this.last_update = now;

        this.time += dt;
        this.engine.update(dt);
    }

    getState() {
        return {
            time: this.time,
            collisions: this.engine.collision_count,
            robot_x: this.robot.position.x,
            robot_y: this.robot.position.y,
            robot_angle: this.robot.angle,
            status: this.engine.success ? 'goal_reached' : (this.running ? 'running' : 'stopped'),
            success: this.engine.success,
            obstacles: this.obstacles.map(o => o.toDict()),
            target: this.engine.target,
            path: this.engine.path.map(p => ({ x: p.x, y: p.y }))
        };
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.generateObstacles(difficulty);
    }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Simulator, Robot, NavigationEngine, Obstacle, Vector2D };
}
