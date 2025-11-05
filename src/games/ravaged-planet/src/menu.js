import {W, H, Z, PLAYER_COLORS} from './constants.js';
import {drawText, drawRect, drawCircle} from './gfx.js';
import {key, afterKeyDelay} from './input.js';

let menuState = 'main'; // 'main', 'settings', 'wallet', 'howtoplay'
let selectedButton = 0;
let buttons = [];
let menuCanvas = null;
let walletAddress = null;

export function initMenu() {
  menuCanvas = document.createElement('canvas');
  menuCanvas.setAttribute('data-menu', 'true');
  menuCanvas.width = W;
  menuCanvas.height = H;
  menuCanvas.style.width = `${W * Z}px`;
  menuCanvas.style.height = `${H * Z}px`;
  menuCanvas.style.position = 'absolute';
  menuCanvas.style.left = '50%';
  menuCanvas.style.top = '50%';
  menuCanvas.style.transform = 'translate(-50%, -50%)';
  menuCanvas.style.zIndex = '1000';
  menuCanvas.style.pointerEvents = 'auto';
  menuCanvas.style.imageRendering = 'pixelated';
  document.body.appendChild(menuCanvas);
  
  resetMenu();
}

export function resetMenu() {
  menuState = 'main';
  selectedButton = 0;
  updateButtons();
}

function updateButtons() {
  buttons = [];
  
  if (menuState === 'main') {
    buttons = [
      {id: 'start', text: 'START GAME', y: 160, action: () => 'start-game'},
      {id: 'settings', text: 'SETTINGS', y: 200, action: () => {menuState = 'settings'; selectedButton = 0; updateButtons(); return null;}},
      {id: 'wallet', text: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'CONNECT WALLET', y: 240, action: () => {menuState = 'wallet'; selectedButton = 0; updateButtons(); return null;}},
      {id: 'howtoplay', text: 'HOW TO PLAY', y: 280, action: () => {menuState = 'howtoplay'; selectedButton = 0; updateButtons(); return null;}},
    ];
  } else if (menuState === 'settings') {
    buttons = [
      {id: 'back', text: 'BACK', y: 330, action: () => {menuState = 'main'; selectedButton = 0; updateButtons(); return null;}},
    ];
  } else if (menuState === 'wallet') {
    buttons = [
      {id: 'connect', text: 'CONNECT METAMASK', y: 180, action: () => connectWallet()},
      {id: 'disconnect', text: 'DISCONNECT', y: 220, action: () => disconnectWallet(), visible: walletAddress !== null},
      {id: 'back', text: 'BACK', y: 330, action: () => {menuState = 'main'; selectedButton = 0; updateButtons(); return null;}},
    ].filter(b => b.visible !== false);
  } else if (menuState === 'howtoplay') {
    buttons = [
      {id: 'back', text: 'BACK', y: 330, action: () => {menuState = 'main'; selectedButton = 0; updateButtons(); return null;}},
    ];
  }
  
  // Reset selected button if out of bounds
  if (selectedButton >= buttons.length) {
    selectedButton = 0;
  }
}

export function updateMenu() {
  if (menuState === null) return null;
  
  // Handle navigation
  if (key('ArrowDown') || key('s') || key('S')) {
    if (!afterKeyDelay()) return null;
    if (selectedButton < buttons.length - 1) {
      selectedButton++;
    }
  }
  if (key('ArrowUp') || key('w') || key('W')) {
    if (!afterKeyDelay()) return null;
    if (selectedButton > 0) {
      selectedButton--;
    }
  }
  
  // Handle selection
  if (key('Enter') || key(' ')) {
    if (!afterKeyDelay()) return null;
    const button = buttons[selectedButton];
    if (button && button.action) {
      const result = button.action();
      if (result !== null) {
        return result;
      }
    }
  }
  
  // Handle escape/back
  if (key('Escape')) {
    if (!afterKeyDelay()) return null;
    if (menuState !== 'main') {
      menuState = 'main';
      selectedButton = 0;
      updateButtons();
    }
  }
  
  return null;
}

export function drawMenu() {
  if (menuState === null) {
    menuCanvas.style.display = 'none';
    return;
  }
  
  menuCanvas.style.display = 'block';
  const ctx = menuCanvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, W, H);
  
  if (menuState === 'main') {
    drawMainMenu(ctx);
  } else if (menuState === 'settings') {
    drawSettingsMenu(ctx);
  } else if (menuState === 'wallet') {
    drawWalletMenu(ctx);
  } else if (menuState === 'howtoplay') {
    drawHowToPlayMenu(ctx);
  }
}

function drawMainMenu(ctx) {
  // Title
  drawText(ctx, 'PGT ROYALE', W/2, 40, 'gold', 'center');
  drawText(ctx, 'BATTLE TANKS', W/2, 55, 'tomato', 'center');
  
  // Decorative line
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W/2 - 80, 70);
  ctx.lineTo(W/2 + 80, 70);
  ctx.stroke();
  
  // Tank roster display
  drawText(ctx, 'TANKS:', W/2, 85, 'white', 'center');
  const tankY = 100;
  const tankSpacing = 50;
  const tankStartX = W/2 - ((PLAYER_COLORS.length - 1) * tankSpacing) / 2;
  
  for (let i = 0; i < PLAYER_COLORS.length; i++) {
    const [color, borderColor] = PLAYER_COLORS[i];
    const tankX = tankStartX + i * tankSpacing;
    
    // Draw tank indicator circle
    drawCircle(ctx, tankX, tankY, 8, color);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(tankX, tankY, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw player number/index
    drawText(ctx, `${i+1}`, tankX, tankY - 2, 'white', 'center');
    
    // Draw player name below
    drawText(ctx, `P${i+1}`, tankX, tankY + 12, color, 'center');
  }
  
  // Buttons
  buttons.forEach((button, index) => {
    const isSelected = index === selectedButton;
    const color = isSelected ? 'gold' : 'white';
    const bgColor = isSelected ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    
    // Button background
    const btnWidth = 200;
    const btnHeight = 30;
    const btnX = W/2 - btnWidth/2;
    const btnY = button.y;
    
    drawRect(ctx, btnX, btnY, btnWidth, btnHeight, bgColor);
    // Draw border manually
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnWidth - 1, btnHeight - 1);
    
    // Button text
    drawText(ctx, button.text, W/2, button.y + 12, color, 'center');
    
    // Selection indicator
    if (isSelected) {
      drawText(ctx, '>', btnX - 15, button.y + 12, 'gold', 'left');
      drawText(ctx, '<', btnX + btnWidth + 5, button.y + 12, 'gold', 'left');
    }
  });
  
  // Footer
  drawText(ctx, 'ARROW KEYS/WASD: NAVIGATE | ENTER/SPACE: SELECT | ESC: BACK', W/2, H - 20, 'gray', 'center');
}

function drawSettingsMenu(ctx) {
  drawText(ctx, 'SETTINGS', W/2, 60, 'gold', 'center');
  
  // Placeholder settings
  drawText(ctx, 'SOUND VOLUME: [COMING SOON]', W/2, 120, 'white', 'center');
  drawText(ctx, 'GRAPHICS QUALITY: [COMING SOON]', W/2, 150, 'white', 'center');
  drawText(ctx, 'CONTROLS: [COMING SOON]', W/2, 180, 'white', 'center');
  
  // Back button
  buttons.forEach((button, index) => {
    const isSelected = index === selectedButton;
    const color = isSelected ? 'gold' : 'white';
    const bgColor = isSelected ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    
    const btnWidth = 150;
    const btnHeight = 25;
    const btnX = W/2 - btnWidth/2;
    const btnY = button.y;
    
    drawRect(ctx, btnX, btnY, btnWidth, btnHeight, bgColor);
    // Draw border manually
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnWidth - 1, btnHeight - 1);
    drawText(ctx, button.text, W/2, button.y + 10, color, 'center');
    
    if (isSelected) {
      drawText(ctx, '>', btnX - 15, button.y + 10, 'gold', 'left');
      drawText(ctx, '<', btnX + btnWidth + 5, button.y + 10, 'gold', 'left');
    }
  });
}

function drawWalletMenu(ctx) {
  drawText(ctx, 'WALLET CONNECTION', W/2, 60, 'gold', 'center');
  
  if (walletAddress) {
    drawText(ctx, 'CONNECTED', W/2, 120, 'greenyellow', 'center');
    drawText(ctx, walletAddress, W/2, 145, 'white', 'center');
    drawText(ctx, 'Network: [AUTO]', W/2, 165, 'gray', 'center');
  } else {
    drawText(ctx, 'NOT CONNECTED', W/2, 120, 'tomato', 'center');
    drawText(ctx, 'Connect your wallet to enable', W/2, 145, 'white', 'center');
    drawText(ctx, 'web3 features and rewards', W/2, 160, 'white', 'center');
  }
  
  // Buttons
  buttons.forEach((button, index) => {
    const isSelected = index === selectedButton;
    const color = isSelected ? 'gold' : 'white';
    const bgColor = isSelected ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    
    const btnWidth = 200;
    const btnHeight = 25;
    const btnX = W/2 - btnWidth/2;
    const btnY = button.y;
    
    drawRect(ctx, btnX, btnY, btnWidth, btnHeight, bgColor);
    // Draw border manually
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnWidth - 1, btnHeight - 1);
    drawText(ctx, button.text, W/2, button.y + 10, color, 'center');
    
    if (isSelected) {
      drawText(ctx, '>', btnX - 15, button.y + 10, 'gold', 'left');
      drawText(ctx, '<', btnX + btnWidth + 5, button.y + 10, 'gold', 'left');
    }
  });
}

function drawHowToPlayMenu(ctx) {
  drawText(ctx, 'HOW TO PLAY', W/2, 40, 'gold', 'center');
  
  // Instructions
  const instructions = [
    'OBJECTIVE: Eliminate all enemy tanks!',
    '',
    'CONTROLS:',
    'LEFT/RIGHT ARROWS: Adjust angle',
    'UP/DOWN ARROWS: Adjust power',
    'TAB: Switch weapons',
    'SPACE: Fire!',
    '',
    'TIP: Watch the wind direction',
    '      and use terrain to your advantage!'
  ];
  
  let y = 80;
  instructions.forEach(line => {
    if (line.trim() === '') {
      y += 5;
    } else {
      const color = line.startsWith('OBJECTIVE') || line.startsWith('CONTROLS') || line.startsWith('TIP') ? 'gold' : 'white';
      drawText(ctx, line, W/2, y, color, 'center');
      y += 15;
    }
  });
  
  // Back button
  buttons.forEach((button, index) => {
    const isSelected = index === selectedButton;
    const color = isSelected ? 'gold' : 'white';
    const bgColor = isSelected ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    
    const btnWidth = 150;
    const btnHeight = 25;
    const btnX = W/2 - btnWidth/2;
    const btnY = button.y;
    
    drawRect(ctx, btnX, btnY, btnWidth, btnHeight, bgColor);
    // Draw border manually
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnWidth - 1, btnHeight - 1);
    drawText(ctx, button.text, W/2, button.y + 10, color, 'center');
    
    if (isSelected) {
      drawText(ctx, '>', btnX - 15, button.y + 10, 'gold', 'left');
      drawText(ctx, '<', btnX + btnWidth + 5, button.y + 10, 'gold', 'left');
    }
  });
}

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        walletAddress = accounts[0];
        updateButtons();
        return null;
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  } else {
    alert('MetaMask is not installed. Please install MetaMask to connect your wallet.');
  }
  return null;
}

function disconnectWallet() {
  walletAddress = null;
  updateButtons();
  return null;
}

export function getMenuState() {
  return menuState;
}

export function showMenu() {
  menuState = 'main';
  selectedButton = 0;
  updateButtons();
  if (menuCanvas) {
    menuCanvas.style.display = 'block';
  }
}

export function hideMenu() {
  menuState = null;
  if (menuCanvas) {
    menuCanvas.style.display = 'none';
  }
}

export function getWalletAddress() {
  return walletAddress;
}

export function isMenuVisible() {
  return menuState !== null;
}
