// Terminal Theme Bridge - Ensures terminal output uses theme colors

(function() {
    'use strict';
    
    console.log('🎨 Terminal Theme Bridge Loading...');
    
    // Wait for terminal to be ready
    function hookTerminalLog() {
        if (!window.terminal || !window.terminal.log) {
            setTimeout(hookTerminalLog, 100);
            return;
        }
        
        console.log('✅ Hooking into terminal.log for theme support...');
        
        const originalLog = window.terminal.log.bind(window.terminal);
        
        window.terminal.log = function(message, type = 'info') {
            // Call original log
            originalLog(message, type);
            
            // Add CSS class to last line added
            setTimeout(() => {
                const output = document.getElementById('terminalOutput');
                if (!output) return;
                
                const lastLine = output.lastElementChild;
                if (lastLine) {
                    // Add type class
                    lastLine.classList.add('terminal-line', type);
                    
                    // Ensure it uses theme colors
                    lastLine.style.removeProperty('color');
                }
            }, 10);
        };
        
        console.log('✅ Terminal log hooked - theme colors will update dynamically!');
    }
    
    // Start hooking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hookTerminalLog);
    } else {
        hookTerminalLog();
    }
    
})();

