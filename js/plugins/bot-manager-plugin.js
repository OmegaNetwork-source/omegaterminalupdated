// Bot Manager Plugin
console.log('[Plugin] Bot Manager - Loaded');

window.BotManager = {
    initialized: true,
    version: '1.0.0',
    bots: [],
    
    // Register a bot
    registerBot: function(botConfig) {
        this.bots.push(botConfig);
        console.log('[Bot Manager] Bot registered:', botConfig.name || 'Unnamed');
    },
    
    // Get active bots
    getActiveBots: function() {
        return this.bots.filter(bot => bot.active);
    },
    
    // Start a bot
    startBot: function(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (bot) {
            bot.active = true;
            console.log('[Bot Manager] Bot started:', botId);
            return true;
        }
        return false;
    },
    
    // Stop a bot
    stopBot: function(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (bot) {
            bot.active = false;
            console.log('[Bot Manager] Bot stopped:', botId);
            return true;
        }
        return false;
    },
    
    // Stop all bots
    stopAllBots: function() {
        this.bots.forEach(bot => bot.active = false);
        console.log('[Bot Manager] All bots stopped');
    }
};

