/* ===================================
   OMEGA TERMINAL - GAMES SYSTEM
   Interactive games with popup interface
   =================================== */

console.log('🎮 Loading Terminal Games System...');

(function() {
    
    class OmegaGamesSystem {
        constructor() {
            this.availableGames = {
                'number': {
                    name: '🔢 Number Guessing',
                    description: 'Guess the secret number between 1-100',
                    difficulty: 'Easy',
                    category: 'Classic',
                    aliases: ['number-guess']
                },
                'cookies': {
                    name: '🍪 Cookie Clicker',
                    description: 'Click cookies to earn points and buy upgrades',
                    difficulty: 'Easy',
                    category: 'Clicker',
                    aliases: ['cookie-clicker']
                },
                'clicker': {
                    name: '⚡ Speed Clicker',
                    description: 'Click as fast as you can in 10 seconds!',
                    difficulty: 'Easy',
                    category: 'Action'
                },
                'snake': {
                    name: '🐍 Snake Game',
                    description: 'Classic snake game with enemies and obstacles',
                    difficulty: 'Medium',
                    category: 'Arcade'
                },
                'perfect-circle': {
                    name: '⭕ Perfect Circle',
                    description: 'Draw the perfect circle without going outside',
                    difficulty: 'Easy',
                    category: 'Drawing'
                },
                'pacman': {
                    name: '👻 Pac-Man',
                    description: 'Eat dots and avoid ghosts in the classic maze',
                    difficulty: 'Medium',
                    category: 'Arcade'
                },
                'brick-breaker': {
                    name: '🎯 Brick Breaker',
                    description: 'Break all bricks with your bouncing ball',
                    difficulty: 'Medium',
                    category: 'Arcade'
                },
                'memory-cards': {
                    name: '🃏 Memory Cards',
                    description: 'Match pairs of cards to test your memory',
                    difficulty: 'Medium', 
                    category: 'Puzzle'
                },
                'omega-runner': {
                    name: '🏃 Omega Runner',
                    description: 'Endless runner game with Omega theme',
                    difficulty: 'Hard',
                    category: 'Action'
                }
            };
            this.currentGame = null;
            this.gameScores = this.loadGameScores();
        }
        
        loadGameScores() {
            const stored = localStorage.getItem('omega_game_scores');
            return stored ? JSON.parse(stored) : {};
        }
        
        saveGameScore(gameName, score, playerName = 'Anonymous') {
            if (!this.gameScores[gameName]) {
                this.gameScores[gameName] = [];
            }
            
            this.gameScores[gameName].push({
                score: score,
                player: playerName,
                timestamp: new Date().toISOString()
            });
            
            // Keep only top 10 scores per game
            this.gameScores[gameName].sort((a, b) => b.score - a.score);
            this.gameScores[gameName] = this.gameScores[gameName].slice(0, 10);
            
            localStorage.setItem('omega_game_scores', JSON.stringify(this.gameScores));
        }
        
        getLeaderboard(gameName) {
            return this.gameScores[gameName] || [];
        }
    }
    
    // Initialize global games system
    window.omegaGames = new OmegaGamesSystem();
    
    // ===================================
    // GAMES COMMANDS INTEGRATION
    // ===================================
    
    window.handleGameCommand = function handleGameCommand(args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'list':
                showGameList();
                break;
                
            case 'play':
                // Handle multi-word game names (join remaining args)
                const gameName = args.slice(1).join('-');
                if (!gameName) {
                    window.terminal.log('Usage: game play <game_name>', 'error');
                    window.terminal.log('💡 Use "game list" to see available games', 'info');
                    return;
                }
                playGame(gameName);
                break;
                
            case 'scores':
            case 'leaderboard':
                if (args.length >= 2) {
                    showGameLeaderboard(args[1]);
                } else {
                    showAllLeaderboards();
                }
                break;
                
            case 'close':
                closeCurrentGame();
                break;
                
            case 'help':
                showGameHelp();
                break;
                
            default:
                window.terminal.log('Unknown game command. Type: game help', 'error');
        }
    };
    
    function showGameHelp() {
        window.terminal.log('🎮 Terminal Games System:', 'info');
        window.terminal.log('', 'output');
        window.terminal.log('🕹️ Commands:', 'output');
        window.terminal.log('  game list                 - Show all available games', 'output');
        window.terminal.log('  play <game_name>          - Launch a game in popup', 'output');
        window.terminal.log('  game scores [game_name]   - Show leaderboards', 'output');
        window.terminal.log('  game close                - Close current game', 'output');
        window.terminal.log('  game help                 - Show this help', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('💡 Examples:', 'output');
        window.terminal.log('  play number               - Start number guessing game', 'output');
        window.terminal.log('  play clicker              - Start speed clicker (10 sec challenge)', 'output');
        window.terminal.log('  play cookies              - Start cookie clicker', 'output');
        window.terminal.log('  play snake                - Start snake game with enemies', 'output');
        window.terminal.log('  play perfect-circle       - Start perfect circle drawing game', 'output');
        window.terminal.log('  play pacman               - Start Pac-Man maze game', 'output');
        window.terminal.log('  play brick-breaker        - Start brick breaker game', 'output');
    }
    
    function showGameList() {
        window.terminal.log('🎮 Available Terminal Games:', 'info');
        window.terminal.log('', 'output');
        
        // Group games by category
        const categories = {};
        Object.entries(window.omegaGames.availableGames).forEach(([key, game]) => {
            if (!categories[game.category]) {
                categories[game.category] = [];
            }
            categories[game.category].push({key, game});
        });
        
        // Display games by category
        Object.keys(categories).sort().forEach(category => {
            window.terminal.log(`📂 ${category} Games:`, 'info');
            categories[category].forEach(({key, game}) => {
                const difficultyColor = game.difficulty === 'Easy' ? 'success' : 
                                       game.difficulty === 'Medium' ? 'warning' : 'error';
                
                let commandText = `play ${key}`;
                if (game.aliases && game.aliases.length > 0) {
                    commandText += ` (or ${game.aliases.map(alias => `play ${alias}`).join(', ')})`;
                }
                
                window.terminal.log(`  🎯 ${game.name} - ${game.description}`, 'output');
                window.terminal.log(`     Command: ${commandText}`, 'info');
                window.terminal.log(`     Difficulty: ${game.difficulty}`, difficultyColor);
            });
            window.terminal.log('', 'output');
        });
        
        window.terminal.log('💡 Use: play <game_name> to start playing!', 'info');
    }
    
    function playGame(gameName) {
        console.log(`🎮 DEBUG: Attempting to play game: '${gameName}'`);
        console.log('🎮 Available games:', Object.keys(window.omegaGames.availableGames));
        
        // Check for direct match first
        let game = window.omegaGames.availableGames[gameName];
        
        // If no direct match, check aliases
        if (!game) {
            for (const [key, gameData] of Object.entries(window.omegaGames.availableGames)) {
                if (gameData.aliases && gameData.aliases.includes(gameName)) {
                    game = gameData;
                    gameName = key; // Use the main key for launching
                    break;
                }
            }
        }
        
        if (!game) {
            window.terminal.log(`❌ Game '${gameName}' not found`, 'error');
            
            // Suggest similar games
            const availableGames = Object.keys(window.omegaGames.availableGames);
            const similar = availableGames.filter(name => 
                name.toLowerCase().includes(gameName.toLowerCase()) || 
                gameName.toLowerCase().includes(name.toLowerCase())
            );
            
            if (similar.length > 0) {
                window.terminal.log(`💡 Did you mean: ${similar.join(', ')}?`, 'info');
            } else {
                window.terminal.log('💡 Available games: ' + availableGames.join(', '), 'info');
            }
            return;
        }
        
        window.terminal.log(`🎮 Launching ${game.name}...`, 'info');
        
        // Close any existing game
        closeCurrentGame();
        
        // Launch the specific game
        switch (gameName) {
            case 'number':
                launchNumberGuessGame();
                break;
            case 'cookies':
                launchCookieClickerGame();
                break;
            case 'clicker':
                launchSpeedClickerGame();
                break;
            case 'snake':
                launchSnakeGame();
                break;
            case 'perfect-circle':
                launchPerfectCircleGame();
                break;
            case 'pacman':
                launchPacmanGame();
                break;
            case 'brick-breaker':
                launchBrickBreakerGame();
                break;
            case 'memory-cards':
                window.terminal.log('🃏 Memory cards game coming soon!', 'warning');
                break;
            case 'omega-runner':
                window.terminal.log('🏃 Omega runner game coming soon!', 'warning');
                break;
            default:
                window.terminal.log(`❌ Game '${gameName}' not implemented yet`, 'error');
        }
    }
    
    window.closeCurrentGame = function closeCurrentGame() {
        const existingGame = document.getElementById('omega-game-popup');
        if (existingGame) {
            existingGame.remove();
            window.terminal.log('🎮 Game closed', 'info');
        }
        
        // Clear any intervals
        if (window.cookieInterval) {
            clearInterval(window.cookieInterval);
            window.cookieInterval = null;
        }
        
        // Clear snake game
        if (window.snakeGame && window.snakeGame.gameLoop) {
            clearInterval(window.snakeGame.gameLoop);
            window.snakeGame.gameLoop = null;
        }
        
        // Clear speed clicker game
        if (window.speedClickerGame && window.speedClickerGame.gameTimer) {
            clearInterval(window.speedClickerGame.gameTimer);
            window.speedClickerGame.gameTimer = null;
        }
        
        // Clear pacman game
        if (window.pacmanGame && window.pacmanGame.gameLoop) {
            clearInterval(window.pacmanGame.gameLoop);
            window.pacmanGame.gameLoop = null;
        }
        
        // Clear brick breaker game
        if (window.brickGame && window.brickGame.gameLoop) {
            clearInterval(window.brickGame.gameLoop);
            window.brickGame.gameLoop = null;
        }
        
        // Remove key handlers
        if (window.snakeKeyHandler) {
            document.removeEventListener('keydown', window.snakeKeyHandler);
        }
        if (window.pacmanKeyHandler) {
            document.removeEventListener('keydown', window.pacmanKeyHandler);
        }
        if (window.brickKeyHandler) {
            document.removeEventListener('keydown', window.brickKeyHandler);
        }
    }
    
    // ===================================
    // NUMBER GUESSING GAME (Simple Test Game)
    // ===================================
    
    function launchNumberGuessGame() {
        const gameHtml = `
            <div id="omega-game-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
                height: 500px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Game Header -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                        🔢 Number Guessing Game
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">
                        Guess the secret number between 1-100!
                    </div>
                    <button onclick="closeCurrentGame()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
                
                <!-- Game Content -->
                <div style="flex: 1; padding: 30px; text-align: center;">
                    <div id="game-message" style="
                        font-size: 18px;
                        margin-bottom: 25px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        🎯 I'm thinking of a number between 1 and 100...
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <input type="number" id="guess-input" placeholder="Enter your guess..." style="
                            width: 100%;
                            padding: 15px 20px;
                            border: none;
                            border-radius: 12px;
                            font-size: 18px;
                            text-align: center;
                            background: rgba(255, 255, 255, 0.9);
                            color: #333;
                            box-sizing: border-box;
                        " min="1" max="100">
                    </div>
                    
                    <button onclick="makeGuess()" style="
                        width: 100%;
                        padding: 15px 20px;
                        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        font-size: 18px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-bottom: 20px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🎯 Make Guess
                    </button>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="newNumberGame()" style="
                            flex: 1;
                            padding: 12px;
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🔄 New Game</button>
                        
                        <button onclick="showNumberScores()" style="
                            flex: 1;
                            padding: 12px;
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🏆 Scores</button>
                    </div>
                </div>
                
                <!-- Game Stats -->
                <div id="game-stats" style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    font-size: 14px;
                    display: flex;
                    justify-content: space-between;
                ">
                    <span>🎯 Attempts: <span id="attempts-count">0</span></span>
                    <span>🏆 Best: <span id="best-score">None</span></span>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHtml);
        
        // Initialize game
        window.currentNumber = Math.floor(Math.random() * 100) + 1;
        window.attempts = 0;
        
        // Load best score
        const scores = window.omegaGames.getLeaderboard('number-guess');
        const bestScore = scores.length > 0 ? Math.min(...scores.map(s => s.score)) : null;
        document.getElementById('best-score').textContent = bestScore ? bestScore + ' attempts' : 'None';
        
        // Focus input
        setTimeout(() => {
            document.getElementById('guess-input').focus();
        }, 100);
        
        // Add enter key support
        document.getElementById('guess-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                makeGuess();
            }
        });
        
        window.terminal.log('🎮 Number guessing game launched!', 'success');
        
        // Game functions (make them globally available)
        window.makeGuess = function() {
            const input = document.getElementById('guess-input');
            const guess = parseInt(input.value);
            
            if (!guess || guess < 1 || guess > 100) {
                document.getElementById('game-message').innerHTML = '❌ Please enter a number between 1-100!';
                return;
            }
            
            window.attempts++;
            document.getElementById('attempts-count').textContent = window.attempts;
            
            if (guess === window.currentNumber) {
                // Win!
                document.getElementById('game-message').innerHTML = `🎉 Congratulations! You guessed it in ${window.attempts} attempts!`;
                
                // Save score
                const playerName = 'Omega Player';
                window.omegaGames.saveGameScore('number-guess', window.attempts, playerName);
                
                // Update best score display
                const scores = window.omegaGames.getLeaderboard('number-guess');
                const bestScore = Math.min(...scores.map(s => s.score));
                document.getElementById('best-score').textContent = bestScore + ' attempts';
                
                window.terminal.log(`🎉 Number guessing game completed in ${window.attempts} attempts!`, 'success');
                
            } else if (guess < window.currentNumber) {
                document.getElementById('game-message').innerHTML = `📈 Too low! The number is higher than ${guess}`;
            } else {
                document.getElementById('game-message').innerHTML = `📉 Too high! The number is lower than ${guess}`;
            }
            
            input.value = '';
            input.focus();
        };
        
        window.newNumberGame = function() {
            window.currentNumber = Math.floor(Math.random() * 100) + 1;
            window.attempts = 0;
            document.getElementById('attempts-count').textContent = '0';
            document.getElementById('game-message').innerHTML = '🎯 I\'m thinking of a new number between 1 and 100...';
            document.getElementById('guess-input').value = '';
            document.getElementById('guess-input').focus();
            window.terminal.log('🎮 New number guessing game started!', 'info');
        };
        
        window.showNumberScores = function() {
            const scores = window.omegaGames.getLeaderboard('number-guess');
            if (scores.length === 0) {
                window.terminal.log('🏆 No scores yet for number guessing game', 'info');
                return;
            }
            
            window.terminal.log('🏆 Number Guessing Leaderboard:', 'success');
            scores.forEach((score, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯';
                window.terminal.log(`${medal} ${score.player}: ${score.score} attempts`, 'output');
            });
        };
    }
    
    // ===================================
    // COOKIE CLICKER GAME
    // ===================================
    
    function launchCookieClickerGame() {
        const gameHtml = `
            <div id="omega-game-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 500px;
                height: 600px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Game Header -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                        🍪 Cookie Clicker
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">
                        Click cookies to earn points and buy upgrades!
                    </div>
                    <button onclick="closeCurrentGame()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
                
                <!-- Game Content -->
                <div style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
                    
                    <!-- Score Display -->
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 32px; font-weight: 700; margin-bottom: 5px;">
                            🍪 <span id="cookie-count">0</span>
                        </div>
                        <div style="font-size: 14px; opacity: 0.8;">
                            <span id="cookies-per-second">0</span> cookies/sec
                        </div>
                    </div>
                    
                    <!-- Cookie Button -->
                    <div style="text-align: center; margin-bottom: 20px;">
                        <button onclick="clickCookie()" id="cookie-button" style="
                            width: 120px;
                            height: 120px;
                            border-radius: 50%;
                            border: none;
                            background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
                            font-size: 60px;
                            cursor: pointer;
                            transition: all 0.1s ease;
                            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                        " onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
                            🍪
                        </button>
                    </div>
                    
                    <!-- Upgrades -->
                    <div style="flex: 1; overflow-y: auto;">
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px; text-align: center;">
                            🛒 Shop
                        </div>
                        
                        <div id="upgrades-list">
                            <div class="upgrade-item" onclick="buyUpgrade('cursor', 10, 1)" style="
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                padding: 12px;
                                margin-bottom: 8px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                                <div>
                                    <div style="font-weight: 600;">👆 Cursor</div>
                                    <div style="font-size: 12px; opacity: 0.8;">+1 cookie per click</div>
                                </div>
                                <div style="font-weight: 600;">🍪 10</div>
                            </div>
                            
                            <div class="upgrade-item" onclick="buyUpgrade('grandma', 100, 5)" style="
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                padding: 12px;
                                margin-bottom: 8px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                                <div>
                                    <div style="font-weight: 600;">👵 Grandma</div>
                                    <div style="font-size: 12px; opacity: 0.8;">+5 cookies per second</div>
                                </div>
                                <div style="font-weight: 600;">🍪 100</div>
                            </div>
                            
                            <div class="upgrade-item" onclick="buyUpgrade('factory', 500, 20)" style="
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                padding: 12px;
                                margin-bottom: 8px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                                <div>
                                    <div style="font-weight: 600;">🏭 Factory</div>
                                    <div style="font-size: 12px; opacity: 0.8;">+20 cookies per second</div>
                                </div>
                                <div style="font-weight: 600;">🍪 500</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHtml);
        
        // Initialize cookie clicker
        window.cookies = 0;
        window.cookiesPerSecond = 0;
        window.clickPower = 1;
        window.upgrades = { cursor: 0, grandma: 0, factory: 0 };
        
        // Start cookie generation
        window.cookieInterval = setInterval(() => {
            window.cookies += window.cookiesPerSecond;
            updateCookieDisplay();
        }, 1000);
        
        window.clickCookie = function() {
            window.cookies += window.clickPower;
            updateCookieDisplay();
            
            // Visual feedback
            const button = document.getElementById('cookie-button');
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        };
        
        window.buyUpgrade = function(type, cost, benefit) {
            if (window.cookies >= cost) {
                window.cookies -= cost;
                window.upgrades[type]++;
                
                if (type === 'cursor') {
                    window.clickPower += benefit;
                } else {
                    window.cookiesPerSecond += benefit;
                }
                
                updateCookieDisplay();
                window.terminal.log(`🛒 Bought ${type} upgrade! Total: ${window.upgrades[type]}`, 'success');
            } else {
                window.terminal.log(`❌ Not enough cookies! Need ${cost}, have ${Math.floor(window.cookies)}`, 'error');
            }
        };
        
        function updateCookieDisplay() {
            document.getElementById('cookie-count').textContent = Math.floor(window.cookies);
            document.getElementById('cookies-per-second').textContent = window.cookiesPerSecond;
        }
        
        window.terminal.log('🍪 Cookie clicker game launched!', 'success');
        window.terminal.log('💡 Click the cookie to earn points and buy upgrades!', 'info');
    }
    
    // ===================================
    // SPEED CLICKER GAME (Simple Test)
    // ===================================
    
    function launchSpeedClickerGame() {
        const gameHtml = `
            <div id="omega-game-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 450px;
                height: 500px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Game Header -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                ">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                        ⚡ Speed Clicker
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">
                        Click as fast as you can in 10 seconds!
                    </div>
                    <button onclick="closeCurrentGame()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                    
                    <button onclick="toggleClickerFullscreen()" style="
                        position: absolute;
                        top: 15px;
                        left: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">🖥️</button>
                </div>
                
                <!-- Game Content -->
                <div style="flex: 1; padding: 30px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                    
                    <!-- Timer and Score -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 18px; font-weight: 600;">
                        <div>⏱️ Time: <span id="clicker-time">10</span>s</div>
                        <div>⚡ Clicks: <span id="clicker-score">0</span></div>
                        <div>🏆 Best: <span id="clicker-best">0</span></div>
                    </div>
                    
                    <!-- Click Button -->
                    <button onclick="speedClick()" id="speed-click-button" style="
                        width: 200px;
                        height: 200px;
                        border-radius: 50%;
                        border: none;
                        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                        font-size: 60px;
                        cursor: pointer;
                        transition: all 0.1s ease;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                        margin: 20px auto;
                        display: block;
                    " onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
                        ⚡
                    </button>
                    
                    <!-- Status -->
                    <div id="clicker-status" style="
                        font-size: 18px;
                        margin-top: 20px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        🎯 Click the lightning button to start!
                    </div>
                    
                    <!-- Controls -->
                    <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
                        <button onclick="startSpeedClicker()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #4ade80, #22c55e);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">🚀 Start</button>
                        
                        <button onclick="resetSpeedClicker()" style="
                            padding: 10px 20px;
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🔄 Reset</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHtml);
        
        // Initialize speed clicker
        window.speedClickerGame = {
            timeLeft: 10,
            clicks: 0,
            gameRunning: false,
            gameTimer: null
        };
        
        // Load best score
        const bestScore = localStorage.getItem('omega_clicker_best_score') || 0;
        document.getElementById('clicker-best').textContent = bestScore;
        
        // Game functions
        window.startSpeedClicker = function() {
            const game = window.speedClickerGame;
            if (game.gameRunning) return;
            
            game.gameRunning = true;
            game.timeLeft = 10;
            game.clicks = 0;
            
            document.getElementById('clicker-status').textContent = '⚡ GO! CLICK AS FAST AS YOU CAN!';
            document.getElementById('clicker-time').textContent = game.timeLeft;
            document.getElementById('clicker-score').textContent = game.clicks;
            
            // Start countdown timer
            game.gameTimer = setInterval(() => {
                game.timeLeft--;
                document.getElementById('clicker-time').textContent = game.timeLeft;
                
                if (game.timeLeft <= 0) {
                    endSpeedClicker();
                }
            }, 1000);
            
            window.terminal.log('⚡ Speed clicker started! Click as fast as you can!', 'success');
        };
        
        window.speedClick = function() {
            const game = window.speedClickerGame;
            if (!game.gameRunning) {
                startSpeedClicker();
                return;
            }
            
            game.clicks++;
            document.getElementById('clicker-score').textContent = game.clicks;
            
            // Visual feedback
            const button = document.getElementById('speed-click-button');
            button.style.background = 'linear-gradient(135deg, #ffd700, #ff8c00)';
            setTimeout(() => {
                button.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
            }, 100);
        };
        
        window.resetSpeedClicker = function() {
            const game = window.speedClickerGame;
            
            if (game.gameTimer) {
                clearInterval(game.gameTimer);
                game.gameTimer = null;
            }
            
            game.gameRunning = false;
            game.timeLeft = 10;
            game.clicks = 0;
            
            document.getElementById('clicker-time').textContent = '10';
            document.getElementById('clicker-score').textContent = '0';
            document.getElementById('clicker-status').textContent = '🎯 Click the lightning button to start!';
        };
        
        function endSpeedClicker() {
            const game = window.speedClickerGame;
            
            clearInterval(game.gameTimer);
            game.gameTimer = null;
            game.gameRunning = false;
            
            const cps = (game.clicks / 10).toFixed(1);
            document.getElementById('clicker-status').textContent = `⚡ Time's up! ${game.clicks} clicks (${cps} clicks/sec)`;
            
            // Check for best score
            const currentBest = localStorage.getItem('omega_clicker_best_score') || 0;
            if (game.clicks > currentBest) {
                localStorage.setItem('omega_clicker_best_score', game.clicks);
                document.getElementById('clicker-best').textContent = game.clicks;
                window.terminal.log(`🎉 NEW RECORD: ${game.clicks} clicks! (${cps} clicks/sec)`, 'success');
            } else {
                window.terminal.log(`⚡ Final score: ${game.clicks} clicks (${cps} clicks/sec)`, 'info');
            }
            
            // Save to leaderboard
            window.omegaGames.saveGameScore('clicker', game.clicks, 'Speed Demon');
        }
        
        window.toggleClickerFullscreen = function() {
            const gamePopup = document.getElementById('omega-game-popup');
            
            if (gamePopup.style.width === '100vw') {
                // Exit fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 450px;
                    height: 500px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
            } else {
                // Enter fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
            }
        };
        
        window.terminal.log('⚡ Speed clicker launched!', 'success');
        window.terminal.log('🎯 Click as fast as you can in 10 seconds!', 'info');
    }
    
    // ===================================
    // SNAKE GAME
    // ===================================
    
    function launchSnakeGame() {
        const gameHtml = `
            <div id="omega-game-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 520px;
                height: 620px;
                background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Game Header -->
                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                        🐍 Snake Game
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">
                        Arrow keys or WASD to move • SPACE to start • F for fullscreen
                    </div>
                    <button onclick="closeCurrentGame()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
                
                <!-- Score Display -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>🎯 Score: <span id="snake-score">0</span></div>
                    <div>🏆 High: <span id="snake-high-score">0</span></div>
                    <div>🏃 Speed: <span id="snake-speed">1</span></div>
                </div>
                
                <!-- Game Canvas -->
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
                    <canvas id="snake-canvas" width="400" height="400" style="
                        border: 2px solid #4299e1;
                        border-radius: 10px;
                        background: #1a202c;
                    "></canvas>
                </div>
                
                <!-- Game Controls -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    text-align: center;
                ">
                    <div id="snake-status" style="font-size: 16px; margin-bottom: 10px;">
                        🎮 Click "🚀 Start Game" or press SPACE to begin!
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="startSnakeGame()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #4299e1, #3182ce);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">🚀 Start Game</button>
                        
                        <button onclick="pauseSnakeGame()" style="
                            padding: 10px 20px;
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">⏸️ Pause</button>
                        
                        <button onclick="resetSnakeGame()" style="
                            padding: 10px 20px;
                            background: rgba(255, 100, 100, 0.8);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🔄 Reset</button>
                        
                        <button onclick="toggleSnakeFullscreen()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #9333ea, #7c3aed);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🖥️ Fullscreen</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHtml);
        
        // Initialize Snake Game
        const canvas = document.getElementById('snake-canvas');
        const ctx = canvas.getContext('2d');
        
        window.snakeGame = {
            canvas: canvas,
            ctx: ctx,
            gridSize: 20,
            tileCount: 20,
            snake: [{x: 10, y: 10}],
            food: {x: 15, y: 15},
            enemies: [],
            dx: 0,
            dy: 0,
            score: 0,
            gameRunning: false,
            gameLoop: null,
            speed: 150,
            enemySpawnTimer: 0,
            enemySpawnRate: 3000 // Spawn enemy every 3 seconds
        };
        
        // Load high score
        const highScore = localStorage.getItem('omega_snake_high_score') || 0;
        document.getElementById('snake-high-score').textContent = highScore;
        
        // Focus the game popup so it can receive keyboard events
        setTimeout(() => {
            const gamePopup = document.getElementById('omega-game-popup');
            gamePopup.focus();
            gamePopup.setAttribute('tabindex', '0'); // Make it focusable
        }, 100);
        
        // Game functions
        window.startSnakeGame = function() {
            const game = window.snakeGame;
            
            if (game.gameRunning) return;
            
            game.gameRunning = true;
            document.getElementById('snake-status').textContent = '🎮 Game Running! Use arrow keys or WASD to move';
            
            game.gameLoop = setInterval(() => {
                updateSnake();
                drawSnakeGame();
            }, game.speed);
            
            window.terminal.log('🚀 Snake game started! Use arrow keys or WASD to control', 'success');
        };
        
        window.pauseSnakeGame = function() {
            const game = window.snakeGame;
            
            if (game.gameLoop) {
                clearInterval(game.gameLoop);
                game.gameLoop = null;
                game.gameRunning = false;
                document.getElementById('snake-status').textContent = '⏸️ Game Paused - Press Start to continue';
            }
        };
        
        window.resetSnakeGame = function() {
            const game = window.snakeGame;
            
            // Stop game loop
            if (game.gameLoop) {
                clearInterval(game.gameLoop);
                game.gameLoop = null;
            }
            
            // Reset game state
            game.snake = [{x: 10, y: 10}];
            game.food = generateSnakeFood();
            game.enemies = [];
            game.dx = 0;
            game.dy = 0;
            game.score = 0;
            game.gameRunning = false;
            game.speed = 150;
            game.enemySpawnTimer = 0;
            
            // Update UI
            document.getElementById('snake-score').textContent = '0';
            document.getElementById('snake-speed').textContent = '1';
            document.getElementById('snake-status').textContent = '🎮 Click "🚀 Start Game" or press SPACE to begin!';
            
            drawSnakeGame();
        };
        
        function updateSnake() {
            const game = window.snakeGame;
            const head = {x: game.snake[0].x + game.dx, y: game.snake[0].y + game.dy};
            
            // Check wall collision
            if (head.x < 0 || head.x >= game.tileCount || head.y < 0 || head.y >= game.tileCount) {
                gameOverSnake();
                return;
            }
            
            // Check self collision
            for (let segment of game.snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameOverSnake();
                    return;
                }
            }
            
            // Check enemy collision
            for (let enemy of game.enemies) {
                if (head.x === enemy.x && head.y === enemy.y) {
                    gameOverSnake();
                    return;
                }
            }
            
            game.snake.unshift(head);
            
            // Check food collision
            if (head.x === game.food.x && head.y === game.food.y) {
                game.score += 10;
                document.getElementById('snake-score').textContent = game.score;
                
                // Increase speed slightly
                if (game.score % 50 === 0) {
                    game.speed = Math.max(80, game.speed - 10);
                    const speedLevel = Math.floor((150 - game.speed) / 10) + 1;
                    document.getElementById('snake-speed').textContent = speedLevel;
                    
                    // Restart loop with new speed
                    clearInterval(game.gameLoop);
                    game.gameLoop = setInterval(() => {
                        updateSnake();
                        drawSnakeGame();
                    }, game.speed);
                }
                
                game.food = generateSnakeFood();
            } else {
                game.snake.pop();
            }
            
            // Spawn enemies
            game.enemySpawnTimer += game.speed;
            if (game.enemySpawnTimer >= game.enemySpawnRate) {
                spawnSnakeEnemy();
                game.enemySpawnTimer = 0;
            }
            
            // Move enemies
            moveSnakeEnemies();
        }
        
        function drawSnakeGame() {
            const game = window.snakeGame;
            const ctx = game.ctx;
            const canvas = game.canvas;
            
            if (!ctx || !canvas) return;
            
            // Clear canvas
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw snake
            ctx.fillStyle = '#4ade80';
            for (let i = 0; i < game.snake.length; i++) {
                const segment = game.snake[i];
                ctx.fillRect(
                    segment.x * game.gridSize + 1, 
                    segment.y * game.gridSize + 1, 
                    game.gridSize - 2, 
                    game.gridSize - 2
                );
                
                // Snake head (different color)
                if (i === 0) {
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(
                        segment.x * game.gridSize + 3, 
                        segment.y * game.gridSize + 3, 
                        game.gridSize - 6, 
                        game.gridSize - 6
                    );
                    ctx.fillStyle = '#4ade80';
                }
            }
            
            // Draw food
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(
                game.food.x * game.gridSize + 2, 
                game.food.y * game.gridSize + 2, 
                game.gridSize - 4, 
                game.gridSize - 4
            );
            
            // Draw enemies
            ctx.fillStyle = '#f59e0b';
            for (let enemy of game.enemies) {
                ctx.fillRect(
                    enemy.x * game.gridSize + 2, 
                    enemy.y * game.gridSize + 2, 
                    game.gridSize - 4, 
                    game.gridSize - 4
                );
                
                // Enemy eyes
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(
                    enemy.x * game.gridSize + 6, 
                    enemy.y * game.gridSize + 6, 
                    3, 3
                );
                ctx.fillRect(
                    enemy.x * game.gridSize + 11, 
                    enemy.y * game.gridSize + 6, 
                    3, 3
                );
                ctx.fillStyle = '#f59e0b';
            }
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= game.tileCount; i++) {
                ctx.beginPath();
                ctx.moveTo(i * game.gridSize, 0);
                ctx.lineTo(i * game.gridSize, canvas.height);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, i * game.gridSize);
                ctx.lineTo(canvas.width, i * game.gridSize);
                ctx.stroke();
            }
        }
        
        function generateSnakeFood() {
            const game = window.snakeGame;
            let food;
            
            do {
                food = {
                    x: Math.floor(Math.random() * game.tileCount),
                    y: Math.floor(Math.random() * game.tileCount)
                };
            } while (game.snake.some(segment => segment.x === food.x && segment.y === food.y) ||
                     game.enemies.some(enemy => enemy.x === food.x && enemy.y === food.y));
            
            return food;
        }
        
        function spawnSnakeEnemy() {
            const game = window.snakeGame;
            let enemy;
            
            do {
                enemy = {
                    x: Math.floor(Math.random() * game.tileCount),
                    y: Math.floor(Math.random() * game.tileCount),
                    dx: Math.random() < 0.5 ? -1 : 1,
                    dy: Math.random() < 0.5 ? -1 : 1
                };
            } while (game.snake.some(segment => segment.x === enemy.x && segment.y === enemy.y) ||
                     game.enemies.some(e => e.x === enemy.x && e.y === enemy.y) ||
                     (enemy.x === game.food.x && enemy.y === game.food.y));
            
            game.enemies.push(enemy);
            
            // Limit max enemies
            if (game.enemies.length > 5) {
                game.enemies.shift();
            }
        }
        
        function moveSnakeEnemies() {
            const game = window.snakeGame;
            
            for (let enemy of game.enemies) {
                // Simple AI: move towards snake head
                const snakeHead = game.snake[0];
                const dx = snakeHead.x - enemy.x;
                const dy = snakeHead.y - enemy.y;
                
                // Move towards snake (with some randomness)
                if (Math.random() < 0.7) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        enemy.dx = dx > 0 ? 1 : -1;
                        enemy.dy = 0;
                    } else {
                        enemy.dx = 0;
                        enemy.dy = dy > 0 ? 1 : -1;
                    }
                }
                
                // Move enemy
                enemy.x += enemy.dx;
                enemy.y += enemy.dy;
                
                // Bounce off walls
                if (enemy.x < 0 || enemy.x >= game.tileCount) {
                    enemy.dx *= -1;
                    enemy.x = Math.max(0, Math.min(game.tileCount - 1, enemy.x));
                }
                if (enemy.y < 0 || enemy.y >= game.tileCount) {
                    enemy.dy *= -1;
                    enemy.y = Math.max(0, Math.min(game.tileCount - 1, enemy.y));
                }
            }
        }
        
        function gameOverSnake() {
            const game = window.snakeGame;
            
            clearInterval(game.gameLoop);
            game.gameLoop = null;
            game.gameRunning = false;
            
            // Check for high score
            const currentHighScore = localStorage.getItem('omega_snake_high_score') || 0;
            if (game.score > currentHighScore) {
                localStorage.setItem('omega_snake_high_score', game.score);
                document.getElementById('snake-high-score').textContent = game.score;
                
                window.terminal.log(`🎉 NEW HIGH SCORE: ${game.score} points!`, 'success');
                document.getElementById('snake-status').textContent = `🎉 NEW HIGH SCORE! ${game.score} points - Press Reset to play again`;
            } else {
                document.getElementById('snake-status').textContent = `💀 Game Over! Score: ${game.score} - Press Reset to play again`;
                window.terminal.log(`💀 Snake game over! Final score: ${game.score}`, 'info');
            }
            
            // Save score to leaderboard
            window.omegaGames.saveGameScore('snake', game.score, 'Omega Player');
        }
        
        // Add keyboard controls with proper event handling
        window.snakeKeyHandler = function(e) {
            if (!document.getElementById('snake-canvas')) return;
            
            const game = window.snakeGame;
            
            // Start game with spacebar
            if (e.code === 'Space') {
                e.preventDefault();
                if (!game.gameRunning) {
                    window.startSnakeGame();
                } else {
                    window.pauseSnakeGame();
                }
                return;
            }
            
            // Arrow key controls - auto-start game on first movement
            if (!game.gameRunning && (e.code.startsWith('Arrow'))) {
                // Set initial direction first
                switch (e.code) {
                    case 'ArrowUp':
                        game.dx = 0;
                        game.dy = -1;
                        break;
                    case 'ArrowDown':
                        game.dx = 0;
                        game.dy = 1;
                        break;
                    case 'ArrowLeft':
                        game.dx = -1;
                        game.dy = 0;
                        break;
                    case 'ArrowRight':
                        game.dx = 1;
                        game.dy = 0;
                        break;
                }
                window.startSnakeGame();
                return;
            }
            
            switch (e.code) {
                case 'ArrowUp':
                    if (game.dy === 0) {
                        game.dx = 0;
                        game.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (game.dy === 0) {
                        game.dx = 0;
                        game.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (game.dx === 0) {
                        game.dx = -1;
                        game.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (game.dx === 0) {
                        game.dx = 1;
                        game.dy = 0;
                    }
                    break;
                // WASD controls
                case 'KeyW':
                    if (game.dy === 0) {
                        game.dx = 0;
                        game.dy = -1;
                    }
                    break;
                case 'KeyS':
                    if (game.dy === 0) {
                        game.dx = 0;
                        game.dy = 1;
                    }
                    break;
                case 'KeyA':
                    if (game.dx === 0) {
                        game.dx = -1;
                        game.dy = 0;
                    }
                    break;
                case 'KeyD':
                    if (game.dx === 0) {
                        game.dx = 1;
                        game.dy = 0;
                    }
                    break;
                case 'KeyF':
                    // Fullscreen toggle
                    e.preventDefault();
                    toggleSnakeFullscreen();
                    break;
            }
            
            e.preventDefault();
        };
        
        document.addEventListener('keydown', window.snakeKeyHandler);
        
        // Initial draw
        drawSnakeGame();
        
        // Add fullscreen functionality
        window.toggleSnakeFullscreen = function() {
            const gamePopup = document.getElementById('omega-game-popup');
            const canvas = document.getElementById('snake-canvas');
            
            if (gamePopup.style.width === '100vw') {
                // Exit fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 520px;
                    height: 620px;
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = 400;
                canvas.height = 400;
                window.snakeGame.tileCount = 20;
                window.terminal.log('🔳 Snake game: Windowed mode', 'info');
            } else {
                // Enter fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = Math.min(800, window.innerWidth - 100);
                canvas.height = Math.min(600, window.innerHeight - 200);
                window.snakeGame.tileCount = Math.floor(canvas.width / 20);
                window.terminal.log('🖥️ Snake game: Fullscreen mode (F key to toggle)', 'success');
            }
            
            // Redraw with new canvas size
            drawSnakeGame();
        };
        
        window.terminal.log('🐍 Snake game launched!', 'success');
        window.terminal.log('🎮 Controls: Arrow keys or WASD to move', 'info');
        window.terminal.log('⚡ SPACE to start/pause • F for fullscreen • Click buttons to control', 'info');
        window.terminal.log('🍎 Eat red food to grow and earn points!', 'info');
        window.terminal.log('⚠️ Avoid orange enemies - they will end your game!', 'warning');
    }
    
    // ===================================
    // PERFECT CIRCLE GAME
    // ===================================
    
    function launchPerfectCircleGame() {
        const gameHtml = `
            <div id="omega-game-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 500px;
                height: 600px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Game Header -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                        ⭕ Perfect Circle
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">
                        Draw the perfect circle without going outside the line!
                    </div>
                    <button onclick="closeCurrentGame()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
                
                <!-- Score Display -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>🎯 Score: <span id="circle-score">0</span></div>
                    <div>🏆 Best: <span id="circle-best">0</span></div>
                    <div>📊 Accuracy: <span id="circle-accuracy">0</span>%</div>
                </div>
                
                <!-- Game Canvas -->
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
                    <canvas id="circle-canvas" width="400" height="400" style="
                        border: 2px solid #4299e1;
                        border-radius: 10px;
                        background: #1a202c;
                        cursor: crosshair;
                    "></canvas>
                </div>
                
                <!-- Game Controls -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    text-align: center;
                ">
                    <div id="circle-status" style="font-size: 16px; margin-bottom: 10px;">
                        🎨 Click and drag to draw your circle!
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="startCircleGame()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #4299e1, #3182ce);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">🎨 New Circle</button>
                        
                        <button onclick="resetCircleGame()" style="
                            padding: 10px 20px;
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🔄 Reset</button>
                        
                        <button onclick="toggleCircleFullscreen()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #9333ea, #7c3aed);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🖥️ Fullscreen</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHtml);
        
        // Initialize Perfect Circle Game
        const canvas = document.getElementById('circle-canvas');
        const ctx = canvas.getContext('2d');
        
        window.circleGame = {
            canvas: canvas,
            ctx: ctx,
            centerX: 200,
            centerY: 200,
            radius: 100,
            isDrawing: false,
            drawingPath: [],
            score: 0,
            bestScore: 0
        };
        
        // Load best score
        const bestScore = localStorage.getItem('omega_circle_best_score') || 0;
        document.getElementById('circle-best').textContent = bestScore;
        window.circleGame.bestScore = bestScore;
        
        // Game functions
        window.startCircleGame = function() {
            const game = window.circleGame;
            
            // Clear canvas
            game.ctx.fillStyle = '#1a202c';
            game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            
            // Draw target circle outline
            game.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            game.ctx.lineWidth = 2;
            game.ctx.beginPath();
            game.ctx.arc(game.centerX, game.centerY, game.radius, 0, 2 * Math.PI);
            game.ctx.stroke();
            
            // Reset drawing
            game.drawingPath = [];
            game.isDrawing = false;
            
            document.getElementById('circle-status').textContent = '🎨 Click and drag to draw your circle!';
            
            window.terminal.log('⭕ New perfect circle challenge started!', 'success');
        };
        
        window.resetCircleGame = function() {
            const game = window.circleGame;
            
            game.score = 0;
            game.drawingPath = [];
            game.isDrawing = false;
            
            document.getElementById('circle-score').textContent = '0';
            document.getElementById('circle-accuracy').textContent = '0';
            document.getElementById('circle-status').textContent = '🎨 Click and drag to draw your circle!';
            
            // Clear canvas
            game.ctx.fillStyle = '#1a202c';
            game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            
            // Draw target circle outline
            game.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            game.ctx.lineWidth = 2;
            game.ctx.beginPath();
            game.ctx.arc(game.centerX, game.centerY, game.radius, 0, 2 * Math.PI);
            game.ctx.stroke();
        };
        
        // Mouse events
        canvas.addEventListener('mousedown', function(e) {
            const game = window.circleGame;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            game.isDrawing = true;
            game.drawingPath = [{x, y}];
            
            // Clear canvas and redraw target
            game.ctx.fillStyle = '#1a202c';
            game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            
            game.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            game.ctx.lineWidth = 2;
            game.ctx.beginPath();
            game.ctx.arc(game.centerX, game.centerY, game.radius, 0, 2 * Math.PI);
            game.ctx.stroke();
            
            // Start drawing
            game.ctx.strokeStyle = '#4ade80';
            game.ctx.lineWidth = 3;
            game.ctx.beginPath();
            game.ctx.moveTo(x, y);
        });
        
        canvas.addEventListener('mousemove', function(e) {
            const game = window.circleGame;
            if (!game.isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            game.drawingPath.push({x, y});
            game.ctx.lineTo(x, y);
            game.ctx.stroke();
        });
        
        canvas.addEventListener('mouseup', function(e) {
            const game = window.circleGame;
            if (!game.isDrawing) return;
            
            game.isDrawing = false;
            evaluateCircle();
        });
        
        function evaluateCircle() {
            const game = window.circleGame;
            
            if (game.drawingPath.length < 10) {
                document.getElementById('circle-status').textContent = '❌ Draw a longer line!';
                return;
            }
            
            // Calculate accuracy
            let insideCount = 0;
            let outsideCount = 0;
            
            for (let point of game.drawingPath) {
                const distance = Math.sqrt(
                    Math.pow(point.x - game.centerX, 2) + 
                    Math.pow(point.y - game.centerY, 2)
                );
                
                if (Math.abs(distance - game.radius) <= 10) {
                    insideCount++;
                } else {
                    outsideCount++;
                }
            }
            
            const accuracy = Math.round((insideCount / game.drawingPath.length) * 100);
            const score = Math.round(accuracy * (game.drawingPath.length / 100));
            
            game.score = score;
            document.getElementById('circle-score').textContent = score;
            document.getElementById('circle-accuracy').textContent = accuracy;
            
            // Check for best score
            if (score > game.bestScore) {
                game.bestScore = score;
                localStorage.setItem('omega_circle_best_score', score);
                document.getElementById('circle-best').textContent = score;
                document.getElementById('circle-status').textContent = `🎉 NEW RECORD! ${score} points (${accuracy}% accuracy)`;
                window.terminal.log(`🎉 NEW PERFECT CIRCLE RECORD: ${score} points!`, 'success');
            } else {
                document.getElementById('circle-status').textContent = `✅ Circle completed! ${score} points (${accuracy}% accuracy)`;
                window.terminal.log(`⭕ Perfect circle completed! Score: ${score} (${accuracy}% accuracy)`, 'info');
            }
            
            // Save to leaderboard
            window.omegaGames.saveGameScore('perfect-circle', score, 'Circle Master');
        }
        
        window.toggleCircleFullscreen = function() {
            const gamePopup = document.getElementById('omega-game-popup');
            const canvas = document.getElementById('circle-canvas');
            
            if (gamePopup.style.width === '100vw') {
                // Exit fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 500px;
                    height: 600px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = 400;
                canvas.height = 400;
                window.terminal.log('🔳 Perfect Circle: Windowed mode', 'info');
            } else {
                // Enter fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = Math.min(600, window.innerWidth - 100);
                canvas.height = Math.min(600, window.innerHeight - 200);
                window.terminal.log('🖥️ Perfect Circle: Fullscreen mode', 'success');
            }
            
            // Redraw
            window.startCircleGame();
        };
        
        // Start first game
        window.startCircleGame();
        
        window.terminal.log('⭕ Perfect Circle game launched!', 'success');
        window.terminal.log('🎨 Click and drag to draw your circle', 'info');
        window.terminal.log('🎯 Stay as close to the white outline as possible!', 'info');
    }
    
    // ===================================
    // PAC-MAN GAME
    // ===================================
    
    function launchPacmanGame() {
        const gameHtml = `
            <div id="omega-game-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                height: 700px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Game Header -->
                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                        👻 Pac-Man
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">
                        Arrow keys to move • Eat dots and avoid ghosts!
                    </div>
                    <button onclick="closeCurrentGame()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
                
                <!-- Score Display -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>🍒 Score: <span id="pacman-score">0</span></div>
                    <div>🏆 High: <span id="pacman-high">0</span></div>
                    <div>👻 Lives: <span id="pacman-lives">3</span></div>
                </div>
                
                <!-- Game Canvas -->
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
                    <canvas id="pacman-canvas" width="500" height="500" style="
                        border: 2px solid #ffd700;
                        border-radius: 10px;
                        background: #000;
                    "></canvas>
                </div>
                
                <!-- Game Controls -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    text-align: center;
                ">
                    <div id="pacman-status" style="font-size: 16px; margin-bottom: 10px;">
                        🎮 Press SPACE to start!
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="startPacmanGame()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #ffd700, #ff8c00);
                            border: none;
                            border-radius: 8px;
                            color: #000;
                            font-weight: 600;
                            cursor: pointer;
                        ">🚀 Start Game</button>
                        
                        <button onclick="pausePacmanGame()" style="
                            padding: 10px 20px;
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">⏸️ Pause</button>
                        
                        <button onclick="resetPacmanGame()" style="
                            padding: 10px 20px;
                            background: rgba(255, 100, 100, 0.8);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🔄 Reset</button>
                        
                        <button onclick="togglePacmanFullscreen()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #9333ea, #7c3aed);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🖥️ Fullscreen</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHtml);
        
        // Initialize Pac-Man Game
        const canvas = document.getElementById('pacman-canvas');
        const ctx = canvas.getContext('2d');
        
        window.pacmanGame = {
            canvas: canvas,
            ctx: ctx,
            gridSize: 20,
            tileCount: 25,
            pacman: {x: 12, y: 18, dx: 0, dy: 0},
            ghosts: [
                {x: 12, y: 9, dx: -1, dy: 0, color: '#ff0000'},
                {x: 11, y: 9, dx: 1, dy: 0, color: '#00ffff'},
                {x: 13, y: 9, dx: -1, dy: 0, color: '#ffb8ff'},
                {x: 12, y: 10, dx: 1, dy: 0, color: '#ffb852'}
            ],
            dots: [],
            score: 0,
            lives: 3,
            gameRunning: false,
            gameLoop: null,
            speed: 200
        };
        
        // Create maze and dots
        createPacmanMaze();
        createPacmanDots();
        
        // Load high score
        const highScore = localStorage.getItem('omega_pacman_high_score') || 0;
        document.getElementById('pacman-high').textContent = highScore;
        
        // Focus the game popup
        setTimeout(() => {
            const gamePopup = document.getElementById('omega-game-popup');
            gamePopup.focus();
            gamePopup.setAttribute('tabindex', '0');
        }, 100);
        
        // Game functions
        window.startPacmanGame = function() {
            const game = window.pacmanGame;
            
            if (game.gameRunning) return;
            
            game.gameRunning = true;
            document.getElementById('pacman-status').textContent = '🎮 Game Running! Use arrow keys to move';
            
            game.gameLoop = setInterval(() => {
                updatePacman();
                drawPacmanGame();
            }, game.speed);
            
            window.terminal.log('👻 Pac-Man game started! Use arrow keys to control', 'success');
        };
        
        window.pausePacmanGame = function() {
            const game = window.pacmanGame;
            
            if (game.gameLoop) {
                clearInterval(game.gameLoop);
                game.gameLoop = null;
                game.gameRunning = false;
                document.getElementById('pacman-status').textContent = '⏸️ Game Paused - Press Start to continue';
            }
        };
        
        window.resetPacmanGame = function() {
            const game = window.pacmanGame;
            
            if (game.gameLoop) {
                clearInterval(game.gameLoop);
                game.gameLoop = null;
            }
            
            game.pacman = {x: 12, y: 18, dx: 0, dy: 0};
            game.ghosts = [
                {x: 12, y: 9, dx: -1, dy: 0, color: '#ff0000'},
                {x: 11, y: 9, dx: 1, dy: 0, color: '#00ffff'},
                {x: 13, y: 9, dx: -1, dy: 0, color: '#ffb8ff'},
                {x: 12, y: 10, dx: 1, dy: 0, color: '#ffb852'}
            ];
            game.score = 0;
            game.lives = 3;
            game.gameRunning = false;
            
            createPacmanDots();
            
            document.getElementById('pacman-score').textContent = '0';
            document.getElementById('pacman-lives').textContent = '3';
            document.getElementById('pacman-status').textContent = '🎮 Press SPACE to start!';
            
            drawPacmanGame();
        };
        
        function createPacmanMaze() {
            // Simple maze walls (represented as blocked tiles)
            window.pacmanGame.walls = new Set();
            
            // Top and bottom walls
            for (let x = 0; x < 25; x++) {
                window.pacmanGame.walls.add(`${x},0`);
                window.pacmanGame.walls.add(`${x},24`);
            }
            
            // Left and right walls
            for (let y = 0; y < 25; y++) {
                window.pacmanGame.walls.add(`0,${y}`);
                window.pacmanGame.walls.add(`24,${y}`);
            }
            
            // Some internal walls
            const wallPositions = [
                '5,5', '6,5', '7,5', '8,5', '9,5', '10,5', '11,5', '12,5', '13,5', '14,5', '15,5', '16,5', '17,5', '18,5', '19,5',
                '5,10', '6,10', '7,10', '8,10', '9,10', '10,10', '11,10', '12,10', '13,10', '14,10', '15,10', '16,10', '17,10', '18,10', '19,10',
                '5,15', '6,15', '7,15', '8,15', '9,15', '10,15', '11,15', '12,15', '13,15', '14,15', '15,15', '16,15', '17,15', '18,15', '19,15',
                '5,20', '6,20', '7,20', '8,20', '9,20', '10,20', '11,20', '12,20', '13,20', '14,20', '15,20', '16,20', '17,20', '18,20', '19,20'
            ];
            
            wallPositions.forEach(pos => window.pacmanGame.walls.add(pos));
        }
        
        function createPacmanDots() {
            const game = window.pacmanGame;
            game.dots = [];
            
            for (let x = 1; x < 24; x++) {
                for (let y = 1; y < 24; y++) {
                    if (!game.walls.has(`${x},${y}`) && 
                        !(x === game.pacman.x && y === game.pacman.y) &&
                        !game.ghosts.some(ghost => ghost.x === x && ghost.y === y)) {
                        game.dots.push({x, y});
                    }
                }
            }
        }
        
        function updatePacman() {
            const game = window.pacmanGame;
            
            // Move Pac-Man
            const newX = game.pacman.x + game.pacman.dx;
            const newY = game.pacman.y + game.pacman.dy;
            
            if (!game.walls.has(`${newX},${newY}`) && newX >= 0 && newX < game.tileCount && newY >= 0 && newY < game.tileCount) {
                game.pacman.x = newX;
                game.pacman.y = newY;
            }
            
            // Check dot collection
            const dotIndex = game.dots.findIndex(dot => dot.x === game.pacman.x && dot.y === game.pacman.y);
            if (dotIndex !== -1) {
                game.dots.splice(dotIndex, 1);
                game.score += 10;
                document.getElementById('pacman-score').textContent = game.score;
                
                if (game.dots.length === 0) {
                    // Level complete
                    window.terminal.log('🎉 Level complete! All dots eaten!', 'success');
                    createPacmanDots();
                }
            }
            
            // Move ghosts
            movePacmanGhosts();
            
            // Check ghost collision
            for (let ghost of game.ghosts) {
                if (ghost.x === game.pacman.x && ghost.y === game.pacman.y) {
                    game.lives--;
                    document.getElementById('pacman-lives').textContent = game.lives;
                    
                    if (game.lives <= 0) {
                        gameOverPacman();
                    } else {
                        // Reset positions
                        game.pacman = {x: 12, y: 18, dx: 0, dy: 0};
                        game.ghosts = [
                            {x: 12, y: 9, dx: -1, dy: 0, color: '#ff0000'},
                            {x: 11, y: 9, dx: 1, dy: 0, color: '#00ffff'},
                            {x: 13, y: 9, dx: -1, dy: 0, color: '#ffb8ff'},
                            {x: 12, y: 10, dx: 1, dy: 0, color: '#ffb852'}
                        ];
                        window.terminal.log(`👻 Caught by ghost! Lives remaining: ${game.lives}`, 'warning');
                    }
                }
            }
        }
        
        function movePacmanGhosts() {
            const game = window.pacmanGame;
            
            for (let ghost of game.ghosts) {
                // Simple AI: move towards Pac-Man
                const dx = game.pacman.x - ghost.x;
                const dy = game.pacman.y - ghost.y;
                
                let newDx = ghost.dx;
                let newDy = ghost.dy;
                
                if (Math.random() < 0.3) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        newDx = dx > 0 ? 1 : -1;
                        newDy = 0;
                    } else {
                        newDx = 0;
                        newDy = dy > 0 ? 1 : -1;
                    }
                }
                
                const newX = ghost.x + newDx;
                const newY = ghost.y + newDy;
                
                if (!game.walls.has(`${newX},${newY}`) && newX >= 0 && newX < game.tileCount && newY >= 0 && newY < game.tileCount) {
                    ghost.x = newX;
                    ghost.y = newY;
                    ghost.dx = newDx;
                    ghost.dy = newDy;
                } else {
                    // Try random direction
                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    const randomDir = directions[Math.floor(Math.random() * directions.length)];
                    const tryX = ghost.x + randomDir[0];
                    const tryY = ghost.y + randomDir[1];
                    
                    if (!game.walls.has(`${tryX},${tryY}`) && tryX >= 0 && tryX < game.tileCount && tryY >= 0 && tryY < game.tileCount) {
                        ghost.x = tryX;
                        ghost.y = tryY;
                        ghost.dx = randomDir[0];
                        ghost.dy = randomDir[1];
                    }
                }
            }
        }
        
        function drawPacmanGame() {
            const game = window.pacmanGame;
            const ctx = game.ctx;
            const canvas = game.canvas;
            
            if (!ctx || !canvas) return;
            
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw walls
            ctx.fillStyle = '#0000ff';
            for (let wall of game.walls) {
                const [x, y] = wall.split(',').map(Number);
                ctx.fillRect(x * game.gridSize, y * game.gridSize, game.gridSize, game.gridSize);
            }
            
            // Draw dots
            ctx.fillStyle = '#ffd700';
            for (let dot of game.dots) {
                ctx.beginPath();
                ctx.arc(
                    dot.x * game.gridSize + game.gridSize / 2,
                    dot.y * game.gridSize + game.gridSize / 2,
                    3, 0, 2 * Math.PI
                );
                ctx.fill();
            }
            
            // Draw Pac-Man
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(
                game.pacman.x * game.gridSize + game.gridSize / 2,
                game.pacman.y * game.gridSize + game.gridSize / 2,
                game.gridSize / 2 - 2, 0, 2 * Math.PI
            );
            ctx.fill();
            
            // Draw ghosts
            for (let ghost of game.ghosts) {
                ctx.fillStyle = ghost.color;
                ctx.fillRect(
                    ghost.x * game.gridSize + 2,
                    ghost.y * game.gridSize + 2,
                    game.gridSize - 4,
                    game.gridSize - 4
                );
                
                // Ghost eyes
                ctx.fillStyle = '#fff';
                ctx.fillRect(ghost.x * game.gridSize + 6, ghost.y * game.gridSize + 6, 3, 3);
                ctx.fillRect(ghost.x * game.gridSize + 11, ghost.y * game.gridSize + 6, 3, 3);
            }
        }
        
        function gameOverPacman() {
            const game = window.pacmanGame;
            
            clearInterval(game.gameLoop);
            game.gameLoop = null;
            game.gameRunning = false;
            
            // Check for high score
            const currentHighScore = localStorage.getItem('omega_pacman_high_score') || 0;
            if (game.score > currentHighScore) {
                localStorage.setItem('omega_pacman_high_score', game.score);
                document.getElementById('pacman-high').textContent = game.score;
                window.terminal.log(`🎉 NEW PAC-MAN HIGH SCORE: ${game.score} points!`, 'success');
                document.getElementById('pacman-status').textContent = `🎉 NEW HIGH SCORE! ${game.score} points - Press Reset to play again`;
            } else {
                document.getElementById('pacman-status').textContent = `💀 Game Over! Score: ${game.score} - Press Reset to play again`;
                window.terminal.log(`💀 Pac-Man game over! Final score: ${game.score}`, 'info');
            }
            
            // Save to leaderboard
            window.omegaGames.saveGameScore('pacman', game.score, 'Pac-Man Master');
        }
        
        // Keyboard controls
        window.pacmanKeyHandler = function(e) {
            if (!document.getElementById('pacman-canvas')) return;
            
            const game = window.pacmanGame;
            
            // Start game with spacebar
            if (e.code === 'Space') {
                e.preventDefault();
                if (!game.gameRunning) {
                    window.startPacmanGame();
                } else {
                    window.pausePacmanGame();
                }
                return;
            }
            
            // Arrow key controls
            switch (e.code) {
                case 'ArrowUp':
                    game.pacman.dx = 0;
                    game.pacman.dy = -1;
                    break;
                case 'ArrowDown':
                    game.pacman.dx = 0;
                    game.pacman.dy = 1;
                    break;
                case 'ArrowLeft':
                    game.pacman.dx = -1;
                    game.pacman.dy = 0;
                    break;
                case 'ArrowRight':
                    game.pacman.dx = 1;
                    game.pacman.dy = 0;
                    break;
            }
            
            e.preventDefault();
        };
        
        document.addEventListener('keydown', window.pacmanKeyHandler);
        
        // Fullscreen functionality
        window.togglePacmanFullscreen = function() {
            const gamePopup = document.getElementById('omega-game-popup');
            const canvas = document.getElementById('pacman-canvas');
            
            if (gamePopup.style.width === '100vw') {
                // Exit fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    height: 700px;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = 500;
                canvas.height = 500;
                window.terminal.log('🔳 Pac-Man: Windowed mode', 'info');
            } else {
                // Enter fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = Math.min(800, window.innerWidth - 100);
                canvas.height = Math.min(600, window.innerHeight - 200);
                window.terminal.log('🖥️ Pac-Man: Fullscreen mode', 'success');
            }
            
            // Redraw
            drawPacmanGame();
        };
        
        // Initial draw
        drawPacmanGame();
        
        window.terminal.log('👻 Pac-Man game launched!', 'success');
        window.terminal.log('🎮 Controls: Arrow keys to move', 'info');
        window.terminal.log('⚡ SPACE to start/pause • Eat yellow dots and avoid ghosts!', 'info');
    }
    
    // ===================================
    // BRICK BREAKER GAME
    // ===================================
    
    function launchBrickBreakerGame() {
        const gameHtml = `
            <div id="omega-game-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                height: 700px;
                background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                z-index: 10000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Game Header -->
                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
                        🎯 Brick Breaker
                    </div>
                    <div style="font-size: 14px; opacity: 0.8;">
                        Arrow keys to move paddle • Break all bricks!
                    </div>
                    <button onclick="closeCurrentGame()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
                
                <!-- Score Display -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>🎯 Score: <span id="brick-score">0</span></div>
                    <div>🏆 High: <span id="brick-high">0</span></div>
                    <div>🎮 Level: <span id="brick-level">1</span></div>
                </div>
                
                <!-- Game Canvas -->
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
                    <canvas id="brick-canvas" width="500" height="400" style="
                        border: 2px solid #4299e1;
                        border-radius: 10px;
                        background: #1a202c;
                    "></canvas>
                </div>
                
                <!-- Game Controls -->
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 15px 20px;
                    text-align: center;
                ">
                    <div id="brick-status" style="font-size: 16px; margin-bottom: 10px;">
                        🎮 Press SPACE to start!
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="startBrickGame()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #4299e1, #3182ce);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">🚀 Start Game</button>
                        
                        <button onclick="pauseBrickGame()" style="
                            padding: 10px 20px;
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">⏸️ Pause</button>
                        
                        <button onclick="resetBrickGame()" style="
                            padding: 10px 20px;
                            background: rgba(255, 100, 100, 0.8);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🔄 Reset</button>
                        
                        <button onclick="toggleBrickFullscreen()" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #9333ea, #7c3aed);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                        ">🖥️ Fullscreen</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHtml);
        
        // Initialize Brick Breaker Game
        const canvas = document.getElementById('brick-canvas');
        const ctx = canvas.getContext('2d');
        
        window.brickGame = {
            canvas: canvas,
            ctx: ctx,
            paddle: {x: 200, y: 350, width: 100, height: 15},
            ball: {x: 250, y: 200, dx: 3, dy: -3, radius: 8},
            bricks: [],
            score: 0,
            level: 1,
            gameRunning: false,
            gameLoop: null,
            speed: 16
        };
        
        // Create bricks
        createBricks();
        
        // Load high score
        const highScore = localStorage.getItem('omega_brick_high_score') || 0;
        document.getElementById('brick-high').textContent = highScore;
        
        // Focus the game popup
        setTimeout(() => {
            const gamePopup = document.getElementById('omega-game-popup');
            gamePopup.focus();
            gamePopup.setAttribute('tabindex', '0');
        }, 100);
        
        // Game functions
        window.startBrickGame = function() {
            const game = window.brickGame;
            
            if (game.gameRunning) return;
            
            game.gameRunning = true;
            document.getElementById('brick-status').textContent = '🎮 Game Running! Use arrow keys to move paddle';
            
            game.gameLoop = setInterval(() => {
                updateBrickGame();
                drawBrickGame();
            }, game.speed);
            
            window.terminal.log('🎯 Brick Breaker game started! Use arrow keys to control paddle', 'success');
        };
        
        window.pauseBrickGame = function() {
            const game = window.brickGame;
            
            if (game.gameLoop) {
                clearInterval(game.gameLoop);
                game.gameLoop = null;
                game.gameRunning = false;
                document.getElementById('brick-status').textContent = '⏸️ Game Paused - Press Start to continue';
            }
        };
        
        window.resetBrickGame = function() {
            const game = window.brickGame;
            
            if (game.gameLoop) {
                clearInterval(game.gameLoop);
                game.gameLoop = null;
            }
            
            game.paddle = {x: 200, y: 350, width: 100, height: 15};
            game.ball = {x: 250, y: 200, dx: 3, dy: -3, radius: 8};
            game.score = 0;
            game.level = 1;
            game.gameRunning = false;
            
            createBricks();
            
            document.getElementById('brick-score').textContent = '0';
            document.getElementById('brick-level').textContent = '1';
            document.getElementById('brick-status').textContent = '🎮 Press SPACE to start!';
            
            drawBrickGame();
        };
        
        function createBricks() {
            const game = window.brickGame;
            game.bricks = [];
            
            const brickWidth = 60;
            const brickHeight = 20;
            const brickPadding = 5;
            const rows = 5;
            const cols = 8;
            
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    game.bricks.push({
                        x: col * (brickWidth + brickPadding) + 20,
                        y: row * (brickHeight + brickPadding) + 50,
                        width: brickWidth,
                        height: brickHeight,
                        color: colors[row % colors.length],
                        destroyed: false
                    });
                }
            }
        }
        
        function updateBrickGame() {
            const game = window.brickGame;
            
            // Move ball
            game.ball.x += game.ball.dx;
            game.ball.y += game.ball.dy;
            
            // Ball collision with walls
            if (game.ball.x - game.ball.radius <= 0 || game.ball.x + game.ball.radius >= game.canvas.width) {
                game.ball.dx = -game.ball.dx;
            }
            if (game.ball.y - game.ball.radius <= 0) {
                game.ball.dy = -game.ball.dy;
            }
            
            // Ball collision with paddle
            if (game.ball.y + game.ball.radius >= game.paddle.y &&
                game.ball.x >= game.paddle.x &&
                game.ball.x <= game.paddle.x + game.paddle.width &&
                game.ball.dy > 0) {
                game.ball.dy = -game.ball.dy;
                
                // Add some spin based on where ball hits paddle
                const hitPos = (game.ball.x - game.paddle.x) / game.paddle.width;
                game.ball.dx = (hitPos - 0.5) * 6;
            }
            
            // Ball collision with bricks
            for (let brick of game.bricks) {
                if (!brick.destroyed &&
                    game.ball.x + game.ball.radius >= brick.x &&
                    game.ball.x - game.ball.radius <= brick.x + brick.width &&
                    game.ball.y + game.ball.radius >= brick.y &&
                    game.ball.y - game.ball.radius <= brick.y + brick.height) {
                    
                    brick.destroyed = true;
                    game.score += 10;
                    document.getElementById('brick-score').textContent = game.score;
                    
                    // Reverse ball direction
                    game.ball.dy = -game.ball.dy;
                    
                    window.terminal.log(`🎯 Brick destroyed! Score: ${game.score}`, 'info');
                }
            }
            
            // Check if all bricks destroyed
            if (game.bricks.every(brick => brick.destroyed)) {
                game.level++;
                document.getElementById('brick-level').textContent = game.level;
                
                // Increase ball speed
                game.ball.dx *= 1.1;
                game.ball.dy *= 1.1;
                
                // Reset ball and paddle
                game.ball = {x: 250, y: 200, dx: game.ball.dx, dy: Math.abs(game.ball.dy), radius: 8};
                game.paddle = {x: 200, y: 350, width: 100, height: 15};
                
                createBricks();
                
                window.terminal.log(`🎉 Level ${game.level} complete!`, 'success');
            }
            
            // Check if ball fell off screen
            if (game.ball.y > game.canvas.height) {
                gameOverBrick();
            }
        }
        
        function drawBrickGame() {
            const game = window.brickGame;
            const ctx = game.ctx;
            const canvas = game.canvas;
            
            if (!ctx || !canvas) return;
            
            // Clear canvas
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw bricks
            for (let brick of game.bricks) {
                if (!brick.destroyed) {
                    ctx.fillStyle = brick.color;
                    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                    
                    // Brick border
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
                }
            }
            
            // Draw paddle
            ctx.fillStyle = '#4299e1';
            ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);
            
            // Draw ball
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Ball border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        function gameOverBrick() {
            const game = window.brickGame;
            
            clearInterval(game.gameLoop);
            game.gameLoop = null;
            game.gameRunning = false;
            
            // Check for high score
            const currentHighScore = localStorage.getItem('omega_brick_high_score') || 0;
            if (game.score > currentHighScore) {
                localStorage.setItem('omega_brick_high_score', game.score);
                document.getElementById('brick-high').textContent = game.score;
                window.terminal.log(`🎉 NEW BRICK BREAKER HIGH SCORE: ${game.score} points!`, 'success');
                document.getElementById('brick-status').textContent = `🎉 NEW HIGH SCORE! ${game.score} points - Press Reset to play again`;
            } else {
                document.getElementById('brick-status').textContent = `💀 Game Over! Score: ${game.score} - Press Reset to play again`;
                window.terminal.log(`💀 Brick Breaker game over! Final score: ${game.score}`, 'info');
            }
            
            // Save to leaderboard
            window.omegaGames.saveGameScore('brick-breaker', game.score, 'Brick Breaker Master');
        }
        
        // Keyboard controls
        window.brickKeyHandler = function(e) {
            if (!document.getElementById('brick-canvas')) return;
            
            const game = window.brickGame;
            
            // Start game with spacebar
            if (e.code === 'Space') {
                e.preventDefault();
                if (!game.gameRunning) {
                    window.startBrickGame();
                } else {
                    window.pauseBrickGame();
                }
                return;
            }
            
            // Arrow key controls for paddle
            switch (e.code) {
                case 'ArrowLeft':
                    if (game.paddle.x > 0) {
                        game.paddle.x -= 20;
                    }
                    break;
                case 'ArrowRight':
                    if (game.paddle.x < game.canvas.width - game.paddle.width) {
                        game.paddle.x += 20;
                    }
                    break;
            }
            
            e.preventDefault();
        };
        
        document.addEventListener('keydown', window.brickKeyHandler);
        
        // Fullscreen functionality
        window.toggleBrickFullscreen = function() {
            const gamePopup = document.getElementById('omega-game-popup');
            const canvas = document.getElementById('brick-canvas');
            
            if (gamePopup.style.width === '100vw') {
                // Exit fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    height: 700px;
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = 500;
                canvas.height = 400;
                window.terminal.log('🔳 Brick Breaker: Windowed mode', 'info');
            } else {
                // Enter fullscreen
                gamePopup.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                    z-index: 10000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `;
                canvas.width = Math.min(800, window.innerWidth - 100);
                canvas.height = Math.min(600, window.innerHeight - 200);
                window.terminal.log('🖥️ Brick Breaker: Fullscreen mode', 'success');
            }
            
            // Redraw
            drawBrickGame();
        };
        
        // Initial draw
        drawBrickGame();
        
        window.terminal.log('🎯 Brick Breaker game launched!', 'success');
        window.terminal.log('🎮 Controls: Arrow keys to move paddle', 'info');
        window.terminal.log('⚡ SPACE to start/pause • Break all bricks to advance!', 'info');
    }
    
    function showGameLeaderboard(gameName) {
        const game = window.omegaGames.availableGames[gameName];
        if (!game) {
            window.terminal.log(`❌ Game '${gameName}' not found`, 'error');
            return;
        }
        
        const scores = window.omegaGames.getLeaderboard(gameName);
        
        if (scores.length === 0) {
            window.terminal.log(`🏆 No scores yet for ${game.name}`, 'info');
            window.terminal.log(`💡 Play the game first: play ${gameName}`, 'info');
            return;
        }
        
        window.terminal.log(`🏆 ${game.name} Leaderboard:`, 'success');
        scores.forEach((score, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯';
            const date = new Date(score.timestamp).toLocaleDateString();
            window.terminal.log(`${medal} ${score.player}: ${score.score} (${date})`, 'output');
        });
    }
    
    function showAllLeaderboards() {
        window.terminal.log('🏆 All Game Leaderboards:', 'info');
        window.terminal.log('', 'output');
        
        Object.keys(window.omegaGames.availableGames).forEach(gameName => {
            const scores = window.omegaGames.getLeaderboard(gameName);
            if (scores.length > 0) {
                const game = window.omegaGames.availableGames[gameName];
                const topScore = scores[0];
                window.terminal.log(`🎮 ${game.name}:`, 'info');
                window.terminal.log(`   🥇 Best: ${topScore.player} (${topScore.score})`, 'success');
                window.terminal.log('', 'output');
            }
        });
    }
    
    // ===================================
    // INTEGRATE WITH TERMINAL COMMAND SYSTEM  
    // ===================================
    
    function integrateGamesWithTerminal() {
        if (window.terminal && window.terminal.executeCommand) {
            console.log('🎮 Integrating games with terminal...');
            
            const originalExecuteCommand = window.terminal.executeCommand;
            window.terminal.executeCommand = function(command) {
                const args = command.trim().split(/\s+/);
                const cmd = args[0].toLowerCase();
                
                if (cmd === 'game') {
                    handleGameCommand(args.slice(1));
                    return;
                } else if (cmd === 'play') {
                    // Direct play command - reconstruct original command to handle hyphens
                    const originalArgs = command.trim().split(' ').slice(1);
                    const gameName = originalArgs.join(' ').replace(/\s+/g, '-');
                    
                    console.log(`🎮 DEBUG Play command: original="${command}", gameName="${gameName}"`);
                    
                    if (!gameName) {
                        window.terminal.log('Usage: play <game_name>', 'error');
                        window.terminal.log('💡 Use "game list" to see available games', 'info');
                        return;
                    }
                    playGame(gameName);
                    return;
                }
                
                return originalExecuteCommand.call(this, command);
            };
            
            console.log('✅ Games commands integrated successfully!');
            return true;
        }
        return false;
    }
    
    // Try to integrate immediately, then poll if not ready
    if (!integrateGamesWithTerminal()) {
        const integrationCheck = setInterval(() => {
            if (integrateGamesWithTerminal()) {
                clearInterval(integrationCheck);
            }
        }, 500);
        
        // Stop trying after 10 seconds
        setTimeout(() => {
            clearInterval(integrationCheck);
        }, 10000);
    }
    
    console.log('✅ Terminal Games System loaded successfully!');
    console.log('🎮 Use "game list" or "play <game>" commands');
    
})();

