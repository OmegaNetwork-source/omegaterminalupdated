import {PLAYER_COLORS} from './constants.js';

let leftPanel = null;
let rightPanel = null;
let playersData = [];

export function initUI() {
  // Get existing panels from HTML or create them
  leftPanel = document.getElementById('left-panel');
  rightPanel = document.getElementById('right-panel');
  
  // If panels don't exist, create them
  if (!leftPanel) {
    leftPanel = document.createElement('div');
    leftPanel.id = 'left-panel';
    leftPanel.innerHTML = '<div class="panel-title">PLAYERS</div><div id="player-roster"></div>';
    const gameContainer = document.getElementById('game-container') || document.body;
    gameContainer.insertBefore(leftPanel, gameContainer.firstChild);
  }
  
  if (!rightPanel) {
    rightPanel = document.createElement('div');
    rightPanel.id = 'right-panel';
    rightPanel.innerHTML = '<div class="panel-title">STATUS</div><div id="player-status"></div>';
    const gameContainer = document.getElementById('game-container') || document.body;
    gameContainer.appendChild(rightPanel);
  }
}

export function updatePlayerRoster(players) {
  if (!leftPanel) {
    // Try to get panel again if it wasn't found
    leftPanel = document.getElementById('left-panel');
    if (!leftPanel) return;
  }
  playersData = players || [];
  const roster = document.getElementById('player-roster');
  if (!roster) return;
  
  roster.innerHTML = '';
  
  if (!players || players.length === 0) {
    roster.innerHTML = '<div class="status-placeholder">No players</div>';
    return;
  }
  
  players.forEach((player, index) => {
    const playerEl = document.createElement('div');
    playerEl.className = `player-item ${player.dead ? 'dead' : ''} ${index === currentPlayerIndex ? 'current' : ''}`;
    
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = player.c || '#fff';
    colorBox.style.borderColor = player.cb || '#000';
    
    const info = document.createElement('div');
    info.className = 'player-info';
    info.innerHTML = `
      <div class="player-name">${player.name || `Player ${index + 1}`}</div>
      <div class="player-stats">
        <span>NRG: ${Math.max(0, Math.floor(player.energy || 0))}</span>
        <span>SCORE: ${player.score || 0}</span>
        <span>K: ${player.kills || 0}</span>
      </div>
    `;
    
    playerEl.appendChild(colorBox);
    playerEl.appendChild(info);
    roster.appendChild(playerEl);
  });
}

let currentPlayerIndex = 0;

export function updatePlayerStatus(player, wind, state) {
  if (!rightPanel) return;
  const statusEl = document.getElementById('player-status');
  if (!statusEl) return;
  
  if (!player || state === 'menu' || state === 'game-over' || state === 'player-win') {
    statusEl.innerHTML = '<div class="status-placeholder">Select START GAME</div>';
    return;
  }
  
  const {name, energy, a, p, shield, score, c, currentWeapon, weapons} = player;
  const weapon = weapons[currentWeapon];
  const weaponName = weapon ? weapon.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase() : 'NONE';
  
  statusEl.innerHTML = `
    <div class="status-section">
      <div class="status-label" style="color: ${c}">${name.toUpperCase()}</div>
      <div class="status-row">
        <span>NRG: <strong>${Math.max(0, Math.floor(energy))}</strong></span>
        <span>SCORE: <strong>${score || 0}</strong></span>
      </div>
      <div class="status-row">
        <span>AIM: <strong>${a}</strong></span>
        <span>PWR: <strong>${p}</strong></span>
      </div>
      <div class="status-row">
        <span>SHD: <strong>${shield ? Math.floor(shield.energy) : 0}</strong></span>
        <span>WPN: <strong>${weapon ? weapon.ammo : 0} ${weaponName}</strong></span>
      </div>
    </div>
    <div class="status-section">
      <div class="status-label">WIND</div>
      <div class="wind-indicator">${wind <= 0 ? '<' : ''}${Math.abs(wind)}${wind >= 0 ? '>' : ''}</div>
    </div>
  `;
}

export function setCurrentPlayer(index) {
  currentPlayerIndex = index;
  updatePlayerRoster(playersData);
}

export function hidePanels() {
  if (leftPanel) leftPanel.style.display = 'none';
  if (rightPanel) rightPanel.style.display = 'none';
}

export function showPanels() {
  if (leftPanel) leftPanel.style.display = 'flex';
  if (rightPanel) rightPanel.style.display = 'flex';
}

