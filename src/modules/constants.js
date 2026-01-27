/**
 * Game Constants - Central configuration for Laser Defense
 * Extracted for easier tuning and maintenance
 */

// Spawning Configuration
export const SPAWN_EDGES = 3;
export const MIN_SPAWN_COOLDOWN = 60;
export const SPAWN_COOLDOWN_REDUCTION = 8;
export const INITIAL_SPAWN_COOLDOWN = 120;
export const SPAWN_PADDING = 40;

// Star Field Configuration
export const STAR_COUNT = 150;
export const STAR_RESET_BOUNDARY = 5;
export const STAR_SPAWN_OFFSET = -10;
export const STAR_MOVEMENT_SPEED = 0.03;
export const TWINKLE_BASE = 0.6;
export const TWINKLE_AMPLITUDE = 0.4;

// Laser Configuration
export const LASER_FIRE_COOLDOWN_MS = 120;
export const LASER_COLLISION_RADIUS = 6;
export const LASER_SPEED = 12;
export const LASER_LIFE = 70;

// Drone Configuration
export const DRONE_MIN_RADIUS = 16;
export const DRONE_RADIUS_VARIANCE = 6;
export const DRONE_BASE_SPEED = 0.7;
export const DRONE_SPEED_VARIANCE = 0.5;
export const DRONE_BASE_HEALTH = 2;
export const MAX_DRONES_PER_WAVE = 18;
export const BASE_DRONES_PER_WAVE = 6;
export const DRONES_PER_WAVE_INCREASE = 2;

// Ground and Display
export const GROUND_LEVEL_OFFSET = 60;
export const ATMOSPHERIC_LINE_SPACING = 26;
export const GROUND_DECORATION_START = 40;
export const GROUND_DECORATION_SPACING = 140;
export const GROUND_DECORATION_WIDTH = 18;
export const GROUND_DECORATION_HEIGHT = 6;

// Particle Configuration
export const PARTICLE_MIN_SIZE = 2;
export const PARTICLE_SIZE_VARIANCE = 2;
export const EXPLOSION_PARTICLE_MIN_SIZE = 3;
export const EXPLOSION_PARTICLE_SIZE_VARIANCE = 4;
export const HIT_PARTICLE_COUNT = 5;
export const EXPLOSION_PARTICLE_COUNT = 18;
export const HIT_PARTICLE_LIFE = 20;
export const EXPLOSION_PARTICLE_LIFE = 35;

// Scoring
export const DRONE_DESTROY_SCORE = 50;
export const GROUND_HIT_DAMAGE = 4;

// Canvas Configuration
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 700;
export const CROSSHAIR_RADIUS = 14;
