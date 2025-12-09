/**
 * Weather Effects System
 * Adds atmospheric particles and visual effects
 */

import {drawRect, plot} from './gfx.js';
import {random, randomInt} from './math.js';

let weatherParticles = [];
let weatherType = 'none'; // 'none', 'dust', 'rain', 'snow'
let wind = 0;

export function setWeather(type, currentWind = 0) {
  weatherType = type;
  wind = currentWind;
  weatherParticles = [];
  
  if (type === 'none') return;
  
  // Initialize particles based on weather type
  const particleCount = type === 'dust' ? 30 : type === 'rain' ? 50 : 40;
  
  for (let i = 0; i < particleCount; i++) {
    weatherParticles.push({
      x: randomInt(0, 1280),
      y: randomInt(-100, 0),
      speed: random(1, 3),
      size: random(0.5, 2),
      alpha: random(0.3, 0.7),
      drift: random(-wind * 0.5, wind * 0.5)
    });
  }
}

export function updateWeather() {
  if (weatherType === 'none' || weatherParticles.length === 0) return;
  
  for (let particle of weatherParticles) {
    // Update position based on weather type
    if (weatherType === 'dust') {
      particle.y += particle.speed * 0.3;
      particle.x += particle.drift * 0.5;
    } else if (weatherType === 'rain') {
      particle.y += particle.speed * 3;
      particle.x += particle.drift * 0.8;
    } else if (weatherType === 'snow') {
      particle.y += particle.speed * 0.8;
      particle.x += particle.drift * 0.3 + Math.sin(particle.y * 0.1) * 0.5;
    }
    
    // Reset if off screen
    if (particle.y > 800) {
      particle.y = randomInt(-50, 0);
      particle.x = randomInt(0, 1280);
    }
    if (particle.x < 0 || particle.x > 1280) {
      particle.x = randomInt(0, 1280);
      particle.y = randomInt(-50, 0);
    }
  }
}

export function drawWeather(ctx, W, H) {
  if (weatherType === 'none' || weatherParticles.length === 0) return;
  
  ctx.save();
  
  for (let particle of weatherParticles) {
    ctx.globalAlpha = particle.alpha;
    
    if (weatherType === 'dust') {
      // Dust particles - small brown/gray dots
      plot(ctx, Math.round(particle.x), Math.round(particle.y), '#8B7355');
      if (particle.size > 1) {
        plot(ctx, Math.round(particle.x + 1), Math.round(particle.y), '#8B7355');
      }
    } else if (weatherType === 'rain') {
      // Rain - vertical lines
      drawRect(ctx, Math.round(particle.x), Math.round(particle.y), 1, Math.round(particle.size * 3), '#88AAFF');
    } else if (weatherType === 'snow') {
      // Snow - white dots with slight glow
      plot(ctx, Math.round(particle.x), Math.round(particle.y), 'white');
      if (particle.size > 1.5) {
        ctx.globalAlpha = particle.alpha * 0.5;
        plot(ctx, Math.round(particle.x + 1), Math.round(particle.y), 'white');
        plot(ctx, Math.round(particle.x), Math.round(particle.y + 1), 'white');
      }
    }
  }
  
  ctx.restore();
}

export function getWeatherType() {
  return weatherType;
}



