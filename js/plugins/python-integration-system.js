/* ===================================
   OMEGA TERMINAL - PYTHON INTEGRATION SYSTEM
   Client-side Python execution with Pyodide + Profile Integration
   =================================== */

console.log('🐍 Loading Python Integration System...');

(function() {
    
    class OmegaPythonSystem {
        constructor() {
            this.pyodide = null;
            this.isInitializing = false;
            this.isReady = false;
            this.runningScripts = new Map();
            this.scriptOutputs = new Map();
            this.scriptStorage = 'omega_python_scripts';
            
            // Initialize immediately
            this.initializePyodide();
        }
        
        async initializePyodide() {
            if (this.isInitializing || this.isReady) return;
            
            this.isInitializing = true;
            
            try {
                if (window.terminal) {
                    window.terminal.log('🐍 Initializing Python environment...', 'info');
                }
                
                // Load Pyodide
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
                document.head.appendChild(script);
                
                await new Promise((resolve) => {
                    script.onload = resolve;
                });
                
                // Initialize Pyodide
                this.pyodide = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
                });
                
                // Install essential packages for trading
                await this.pyodide.loadPackage(['micropip', 'numpy', 'pandas']);
                
                // Set up terminal integration
                this.setupPythonEnvironment();
                
                this.isReady = true;
                this.isInitializing = false;
                
                if (window.terminal) {
                    window.terminal.log('✅ Python environment ready! Available packages: numpy, pandas, micropip', 'success');
                    window.terminal.log('💡 Type: python help (for Python commands)', 'info');
                }
                
            } catch (error) {
                console.error('Failed to initialize Python:', error);
                if (window.terminal) {
                    window.terminal.log('❌ Failed to initialize Python: ' + error.message, 'error');
                }
                this.isInitializing = false;
            }
        }
        
        setupPythonEnvironment() {
            // Create Python environment with terminal integration
            this.pyodide.runPython(`
import sys
import io
import json
from js import window, console, localStorage, fetch
import asyncio

# Terminal integration
class TerminalOutput:
    def __init__(self):
        self.buffer = []
    
    def write(self, text):
        self.buffer.append(str(text))
        if hasattr(window, 'terminal') and window.terminal:
            window.terminal.log(str(text).strip(), 'output')
    
    def flush(self):
        pass
    
    def get_output(self):
        return ''.join(self.buffer)

# Redirect stdout to terminal
terminal_output = TerminalOutput()
sys.stdout = terminal_output

# Trading utilities
class OmegaTrading:
    @staticmethod
    def get_price(token_symbol):
        """Get current token price"""
        try:
            # This will be expanded to use actual price feeds
            console.log(f"Getting price for {token_symbol}")
            return {"symbol": token_symbol, "price": "Coming soon", "source": "DexScreener"}
        except Exception as e:
            console.error(f"Price fetch error: {e}")
            return None
    
    @staticmethod
    def get_wallet_address():
        """Get connected wallet address"""
        if hasattr(window, 'terminal') and window.terminal and hasattr(window.terminal, 'walletAddress'):
            return window.terminal.walletAddress
        return None
    
    @staticmethod  
    def log(message, level='info'):
        """Log to terminal"""
        if hasattr(window, 'terminal') and window.terminal:
            window.terminal.log(str(message), level)

# Make trading utilities available globally
trading = OmegaTrading()

print("🐍 Python environment configured for Omega Terminal")
print("📊 Available: trading.get_price('BTC'), trading.get_wallet_address()")
            `);
        }
        
        async runPythonCode(code, scriptName = 'inline') {
            if (!this.isReady) {
                throw new Error('Python environment not ready. Please wait for initialization.');
            }
            
            try {
                // Create output capture
                const outputId = Date.now().toString();
                this.scriptOutputs.set(outputId, []);
                
                // Run the Python code
                const result = await this.pyodide.runPythonAsync(code);
                
                // Get any printed output
                const output = this.pyodide.runPython('terminal_output.get_output()');
                
                return {
                    success: true,
                    result: result,
                    output: output,
                    scriptName: scriptName
                };
                
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    scriptName: scriptName
                };
            }
        }
        
        getStoredScripts() {
            const stored = localStorage.getItem(this.scriptStorage);
            return stored ? JSON.parse(stored) : {};
        }
        
        saveScript(name, code, description = '') {
            const scripts = this.getStoredScripts();
            scripts[name] = {
                code: code,
                description: description,
                created: new Date().toISOString(),
                lastRun: null,
                runCount: 0
            };
            localStorage.setItem(this.scriptStorage, JSON.stringify(scripts));
            return true;
        }
        
        deleteScript(name) {
            const scripts = this.getStoredScripts();
            if (scripts[name]) {
                delete scripts[name];
                localStorage.setItem(this.scriptStorage, JSON.stringify(scripts));
                return true;
            }
            return false;
        }
        
        async runStoredScript(name) {
            const scripts = this.getStoredScripts();
            if (!scripts[name]) {
                throw new Error(`Script '${name}' not found`);
            }
            
            // Update run statistics
            scripts[name].lastRun = new Date().toISOString();
            scripts[name].runCount = (scripts[name].runCount || 0) + 1;
            localStorage.setItem(this.scriptStorage, JSON.stringify(scripts));
            
            return await this.runPythonCode(scripts[name].code, name);
        }
        
        stopScript(name) {
            if (this.runningScripts.has(name)) {
                // In a real implementation, we'd need proper async cancellation
                this.runningScripts.delete(name);
                return true;
            }
            return false;
        }
        
        getScriptLogs(name) {
            return this.scriptOutputs.get(name) || [];
        }
    }
    
    // Initialize global Python system
    window.omegaPython = new OmegaPythonSystem();
    
    // ===================================
    // PYTHON COMMANDS INTEGRATION
    // ===================================
    
    window.handlePythonCommand = function handlePythonCommand(args) {
        if (!window.omegaPython.isReady && !window.omegaPython.isInitializing) {
            window.terminal.log('⏳ Python environment not ready. Initializing...', 'warning');
            window.omegaPython.initializePyodide();
            return;
        }
        
        if (window.omegaPython.isInitializing) {
            window.terminal.log('⏳ Python is still initializing. Please wait...', 'info');
            return;
        }
        
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'help':
                showPythonHelp();
                break;
                
            case 'run':
                if (args.length < 2) {
                    window.terminal.log('Usage: python run <script_name>', 'error');
                    return;
                }
                runPythonScript(args[1]);
                break;
                
            case 'list':
            case 'bots':
            case 'scripts':
                listPythonScripts();
                break;
                
            case 'upload':
                uploadPythonScript();
                break;
                
            case 'delete':
            case 'remove':
                if (args.length < 2) {
                    window.terminal.log('Usage: python delete <script_name>', 'error');
                    return;
                }
                deletePythonScript(args[1]);
                break;
                
            case 'stop':
                if (args.length < 2) {
                    window.terminal.log('Usage: python stop <script_name>', 'error');
                    return;
                }
                stopPythonScript(args[1]);
                break;
                
            case 'logs':
                if (args.length < 2) {
                    window.terminal.log('Usage: python logs <script_name>', 'error');
                    return;
                }
                showScriptLogs(args[1]);
                break;
                
            case 'exec':
            case 'execute':
                if (args.length < 2) {
                    window.terminal.log('Usage: python exec <python_code>', 'error');
                    return;
                }
                const code = args.slice(1).join(' ');
                executePythonCode(code);
                break;
                
            case 'status':
                showPythonStatus();
                break;
                
            case 'view':
            case 'show':
                if (args.length < 2) {
                    window.terminal.log('Usage: python view <script_name>', 'error');
                    return;
                }
                viewPythonScript(args[1]);
                break;
                
            case 'debug':
                if (args.length < 2) {
                    window.terminal.log('Usage: python debug <script_name>', 'error');
                    return;
                }
                debugPythonScript(args[1]);
                break;
                
            case 'clear':
            case 'reset':
                clearAllPythonScripts();
                break;
                
            case 'test':
                createTestScript();
                break;
                
            default:
                window.terminal.log('Unknown Python command. Type: python help', 'error');
        }
    }
    
    window.showPythonHelp = function showPythonHelp() {
        window.terminal.log('🐍 Python Integration Commands:', 'info');
        window.terminal.log('', 'output');
        window.terminal.log('📁 Script Management:', 'output');
        window.terminal.log('  python upload              - Upload Python script via profile', 'output');
        window.terminal.log('  python list               - List all stored scripts', 'output');
        window.terminal.log('  python run <name>         - Execute stored script', 'output');
        window.terminal.log('  python delete <name>      - Delete stored script', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('⚡ Execution:', 'output');
        window.terminal.log('  python exec <code>        - Execute Python code directly', 'output');
        window.terminal.log('  python stop <name>        - Stop running script', 'output');
        window.terminal.log('  python logs <name>        - View script execution logs', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('📊 Utilities:', 'output');
        window.terminal.log('  python status             - Show Python environment status', 'output');
        window.terminal.log('  python help               - Show this help', 'output');
        window.terminal.log('  python view <name>        - View script contents', 'output');
        window.terminal.log('  python debug <name>       - Debug script errors', 'output');
        window.terminal.log('  python clear              - Clear all stored scripts', 'output');
        window.terminal.log('  python test               - Create a test script', 'output');
        window.terminal.log('', 'output');
        window.terminal.log('💡 Example Trading Bot:', 'output');
        window.terminal.log('  python exec print("Hello from Python!")', 'output');
        window.terminal.log('  python exec price = trading.get_price("BTC"); print(f"BTC: {price}")', 'output');
    }
    
    async function runPythonScript(scriptName) {
        try {
            // Check if script exists and suggest alternatives
            const scripts = window.omegaPython.getStoredScripts();
            const scriptNames = Object.keys(scripts);
            
            if (!scripts[scriptName]) {
                window.terminal.log(`❌ Script '${scriptName}' not found`, 'error');
                
                // Suggest similar names
                const similar = scriptNames.filter(name => 
                    name.toLowerCase().includes(scriptName.toLowerCase()) || 
                    scriptName.toLowerCase().includes(name.toLowerCase())
                );
                
                if (similar.length > 0) {
                    window.terminal.log(`💡 Did you mean: ${similar.join(', ')}?`, 'info');
                } else if (scriptNames.length > 0) {
                    window.terminal.log(`💡 Available scripts: ${scriptNames.join(', ')}`, 'info');
                } else {
                    window.terminal.log(`💡 No scripts stored. Use 'python upload' to add scripts.`, 'info');
                }
                return;
            }
            
            window.terminal.log(`🚀 Running Python script: ${scriptName}`, 'info');
            const result = await window.omegaPython.runStoredScript(scriptName);
            
            if (result.success) {
                window.terminal.log(`✅ Script '${scriptName}' completed successfully`, 'success');
                if (result.result !== undefined && result.result !== null) {
                    window.terminal.log(`Result: ${result.result}`, 'output');
                }
            } else {
                window.terminal.log(`❌ Script '${scriptName}' failed:`, 'error');
                window.terminal.log(`${result.error}`, 'error');
                
                // Help with common Python errors
                if (result.error.includes('IndentationError')) {
                    window.terminal.log(`💡 Fix: Check your Python script indentation (spaces vs tabs)`, 'info');
                } else if (result.error.includes('SyntaxError')) {
                    window.terminal.log(`💡 Fix: Check your Python script syntax`, 'info');
                } else if (result.error.includes('NameError')) {
                    window.terminal.log(`💡 Fix: Check for undefined variables or imports`, 'info');
                }
            }
        } catch (error) {
            window.terminal.log(`❌ Error running script: ${error.message}`, 'error');
        }
    }
    
    function listPythonScripts() {
        const scripts = window.omegaPython.getStoredScripts();
        const scriptNames = Object.keys(scripts);
        
        if (scriptNames.length === 0) {
            window.terminal.log('📁 No Python scripts stored', 'info');
            window.terminal.log('💡 Use "python upload" to add scripts via your profile', 'info');
            return;
        }
        
        window.terminal.log(`📁 Stored Python Scripts (${scriptNames.length}):`, 'info');
        window.terminal.log('', 'output');
        
        scriptNames.forEach(name => {
            const script = scripts[name];
            const runCount = script.runCount || 0;
            const lastRun = script.lastRun ? new Date(script.lastRun).toLocaleString() : 'Never';
            
            window.terminal.log(`🐍 ${name}`, 'output');
            window.terminal.log(`   📝 ${script.description || 'No description'}`, 'output');
            window.terminal.log(`   📊 Runs: ${runCount} | Last: ${lastRun}`, 'output');
            window.terminal.log('', 'output');
        });
        
        window.terminal.log('💡 Use: python run <script_name>', 'info');
    }
    
    function uploadPythonScript() {
        window.terminal.log('📁 Opening profile to upload Python script...', 'info');
        window.terminal.log('💡 Navigate to Profile → Python Scripts section', 'info');
        
        // Open profile if available
        if (window.openProfileCommand) {
            setTimeout(() => {
                window.openProfileCommand();
                // Highlight Python section
                setTimeout(() => {
                    const pythonSection = document.querySelector('.python-scripts-section');
                    if (pythonSection) {
                        pythonSection.style.border = '2px solid #007AFF';
                        pythonSection.style.borderRadius = '12px';
                        pythonSection.scrollIntoView({ behavior: 'smooth' });
                        
                        setTimeout(() => {
                            pythonSection.style.border = '';
                        }, 3000);
                    }
                }, 500);
            }, 100);
        } else {
            window.terminal.log('💡 Use "profile" command to access script upload', 'info');
        }
    }
    
    function deletePythonScript(scriptName) {
        const success = window.omegaPython.deleteScript(scriptName);
        if (success) {
            window.terminal.log(`✅ Deleted Python script: ${scriptName}`, 'success');
        } else {
            window.terminal.log(`❌ Script '${scriptName}' not found`, 'error');
        }
    }
    
    function stopPythonScript(scriptName) {
        const success = window.omegaPython.stopScript(scriptName);
        if (success) {
            window.terminal.log(`⏹️ Stopped Python script: ${scriptName}`, 'info');
        } else {
            window.terminal.log(`❌ Script '${scriptName}' is not running`, 'error');
        }
    }
    
    function showScriptLogs(scriptName) {
        const logs = window.omegaPython.getScriptLogs(scriptName);
        if (logs.length === 0) {
            window.terminal.log(`📄 No logs available for script: ${scriptName}`, 'info');
            return;
        }
        
        window.terminal.log(`📄 Logs for script: ${scriptName}`, 'info');
        logs.forEach(log => {
            window.terminal.log(log, 'output');
        });
    }
    
    function viewPythonScript(scriptName) {
        const scripts = window.omegaPython.getStoredScripts();
        if (!scripts[scriptName]) {
            window.terminal.log(`❌ Script '${scriptName}' not found`, 'error');
            const scriptNames = Object.keys(scripts);
            if (scriptNames.length > 0) {
                window.terminal.log(`💡 Available scripts: ${scriptNames.join(', ')}`, 'info');
            }
            return;
        }
        
        const script = scripts[scriptName];
        window.terminal.log(`📄 Viewing script: ${scriptName}`, 'info');
        window.terminal.log(`📝 Description: ${script.description || 'No description'}`, 'info');
        window.terminal.log(`📊 Run count: ${script.runCount || 0}`, 'info');
        window.terminal.log('', 'output');
        window.terminal.log('📋 Script contents:', 'info');
        window.terminal.log('================', 'output');
        
        // Display script with line numbers
        const lines = script.code.split('\n');
        lines.forEach((line, index) => {
            const lineNum = (index + 1).toString().padStart(3, ' ');
            window.terminal.log(`${lineNum}| ${line}`, 'output');
        });
        
        window.terminal.log('================', 'output');
    }
    
    function debugPythonScript(scriptName) {
        const scripts = window.omegaPython.getStoredScripts();
        if (!scripts[scriptName]) {
            window.terminal.log(`❌ Script '${scriptName}' not found`, 'error');
            return;
        }
        
        const script = scripts[scriptName];
        window.terminal.log(`🐛 Debugging script: ${scriptName}`, 'info');
        window.terminal.log('', 'output');
        
        // Basic syntax checking
        const lines = script.code.split('\n');
        let issues = [];
        
        // Check for common issues
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmed = line.trim();
            
            // Check for mixed tabs and spaces (common cause of IndentationError)
            if (line.match(/^\t/) && script.code.includes('    ')) {
                issues.push(`Line ${lineNum}: Mixed tabs and spaces detected`);
            }
            
            // Check for common syntax issues
            if (trimmed.match(/^(if|for|while|def|class|try|except|with).*[^:]$/)) {
                issues.push(`Line ${lineNum}: Missing colon after '${trimmed.split(' ')[0]}'`);
            }
            
            // Check for undefined variables (basic check)
            if (trimmed.includes('self.') && !script.code.includes('class ')) {
                issues.push(`Line ${lineNum}: 'self' used outside of class`);
            }
        });
        
        if (issues.length > 0) {
            window.terminal.log('🚨 Potential issues found:', 'error');
            issues.forEach(issue => {
                window.terminal.log(`  • ${issue}`, 'error');
            });
        } else {
            window.terminal.log('✅ No obvious syntax issues detected', 'success');
        }
        
        window.terminal.log('', 'output');
        window.terminal.log('💡 Common fixes:', 'info');
        window.terminal.log('  • Use consistent indentation (4 spaces recommended)', 'output');
        window.terminal.log('  • Ensure all if/for/while/def statements end with :', 'output');
        window.terminal.log('  • Check for missing imports', 'output');
        window.terminal.log('  • Verify variable names are defined before use', 'output');
        
        window.terminal.log('', 'output');
        window.terminal.log(`💡 To view full code: python view ${scriptName}`, 'info');
    }
    
    function clearAllPythonScripts() {
        const scripts = window.omegaPython.getStoredScripts();
        const scriptNames = Object.keys(scripts);
        
        if (scriptNames.length === 0) {
            window.terminal.log('📁 No scripts to clear', 'info');
            return;
        }
        
        localStorage.removeItem(window.omegaPython.scriptStorage);
        window.terminal.log(`🗑️ Cleared ${scriptNames.length} Python script(s)`, 'success');
        window.terminal.log('💡 Use "python test" to create a test script', 'info');
    }
    
    function createTestScript() {
        const testCode = `# 🐍 Omega Terminal Python Test Script
print("🚀 Hello from Omega Terminal Python!")
print("=" * 40)

# Test basic Python functionality
import sys
print(f"Python version: {sys.version}")

# Test numpy (if available)
try:
    import numpy as np
    arr = np.array([1, 2, 3, 4, 5])
    print(f"NumPy test: {arr.mean()}")
except ImportError:
    print("NumPy not available")

# Test trading utilities
print("\\n🔗 Testing Omega trading utilities:")
wallet = trading.get_wallet_address()
if wallet:
    print(f"Connected wallet: {wallet}")
else:
    print("No wallet connected")

# Test price function
print("\\n📊 Testing price function:")
btc_info = trading.get_price("BTC")
print(f"BTC data: {btc_info}")

# Test logging to terminal
trading.log("✅ Test script completed successfully!", "success")
trading.log("💡 This message appears in the terminal", "info")

print("\\n🎯 All tests completed!")`;
        
        const success = window.omegaPython.saveScript('test_script', testCode, 'Basic functionality test for Omega Terminal Python integration');
        
        if (success) {
            window.terminal.log('✅ Test script created successfully!', 'success');
            window.terminal.log('🚀 Run it with: python run test_script', 'info');
            window.terminal.log('📄 View it with: python view test_script', 'info');
        } else {
            window.terminal.log('❌ Failed to create test script', 'error');
        }
    }
    
    async function executePythonCode(code) {
        try {
            window.terminal.log('🐍 Executing Python code...', 'info');
            const result = await window.omegaPython.runPythonCode(code);
            
            if (result.success) {
                if (result.result !== undefined && result.result !== null) {
                    window.terminal.log(`${result.result}`, 'output');
                }
            } else {
                window.terminal.log(`❌ Python error: ${result.error}`, 'error');
            }
        } catch (error) {
            window.terminal.log(`❌ Execution error: ${error.message}`, 'error');
        }
    }
    
    function showPythonStatus() {
        window.terminal.log('🐍 Python Environment Status:', 'info');
        window.terminal.log('', 'output');
        
        if (window.omegaPython.isReady) {
            window.terminal.log('✅ Status: Ready', 'success');
            window.terminal.log('📦 Pyodide Version: 0.24.1', 'output');
            window.terminal.log('📚 Packages: numpy, pandas, micropip', 'output');
            
            const scripts = window.omegaPython.getStoredScripts();
            window.terminal.log(`📁 Stored Scripts: ${Object.keys(scripts).length}`, 'output');
            
            const runningCount = window.omegaPython.runningScripts.size;
            window.terminal.log(`⚡ Running Scripts: ${runningCount}`, 'output');
            
        } else if (window.omegaPython.isInitializing) {
            window.terminal.log('⏳ Status: Initializing...', 'warning');
        } else {
            window.terminal.log('❌ Status: Not initialized', 'error');
        }
        
        const walletAddress = window.omegaPython.pyodide ? 
            window.omegaPython.pyodide.runPython('trading.get_wallet_address()') : 'Not available';
        window.terminal.log(`🔗 Wallet Access: ${walletAddress || 'Not connected'}`, 'output');
    }
    
    // ===================================
    // INTEGRATE WITH TERMINAL COMMAND SYSTEM
    // ===================================
    
    function integrateWithTerminal() {
        if (window.terminal && window.terminal.executeCommand) {
            console.log('🐍 Integrating Python commands with terminal...');
            
            const originalExecuteCommand = window.terminal.executeCommand;
            window.terminal.executeCommand = function(command) {
                const args = command.trim().split(/\s+/);
                
                if (args[0].toLowerCase() === 'python') {
                    handlePythonCommand(args.slice(1));
                    return;
                }
                
                return originalExecuteCommand.call(this, command);
            };
            
            console.log('✅ Python commands integrated successfully!');
            return true;
        }
        return false;
    }
    
    // Try to integrate immediately, then poll if not ready
    if (!integrateWithTerminal()) {
        const integrationCheck = setInterval(() => {
            if (integrateWithTerminal()) {
                clearInterval(integrationCheck);
            }
        }, 500);
        
        // Stop trying after 10 seconds
        setTimeout(() => {
            clearInterval(integrationCheck);
        }, 10000);
    }
    
    // ===================================
    // ENHANCE PROFILE SYSTEM WITH PYTHON UPLOAD
    // ===================================
    
    function enhanceProfileWithPython() {
        // Wait for profile system to be ready
        setTimeout(() => {
            const sidebar = document.getElementById('profile-command-sidebar');
            if (sidebar) {
                addPythonSectionToProfile(sidebar);
            }
        }, 1000);
    }
    
    function addPythonSectionToProfile(sidebar) {
        // Find the profile content area
        const profileContent = sidebar.querySelector('div[style*="padding: 24px"]');
        if (!profileContent) return;
        
        // Add Python Scripts section
        const pythonSection = document.createElement('div');
        pythonSection.className = 'python-scripts-section';
        pythonSection.style.cssText = `
            background: rgba(255, 149, 0, 0.05);
            border: 1px solid rgba(255, 149, 0, 0.15);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
        `;
        
        pythonSection.innerHTML = `
            <div style="font-size: 1.2em; font-weight: 700; color: #FF9500; margin-bottom: 8px;">🐍 Python Scripts</div>
            <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.9em; margin-bottom: 16px; line-height: 1.4; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                Upload and manage Python trading bots and scripts. Execute them directly in the terminal.
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">📁 Upload Python Script</label>
                <input type="file" id="python-file-upload" accept=".py,.txt" style="
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    font-size: 0.85em;
                    background: rgba(255, 255, 255, 0.95);
                    color: #1D1D1F;
                    box-sizing: border-box;
                ">
                <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.75em; margin-top: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                    Supports .py files and .txt files containing Python code
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">🏷️ Script Name</label>
                <input type="text" id="python-script-name" placeholder="e.g., sniping_bot, price_monitor" style="
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    font-size: 0.85em;
                    background: rgba(255, 255, 255, 0.95);
                    color: #1D1D1F;
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #FFFFFF; font-weight: 600; margin-bottom: 6px; font-size: 0.9em; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">📝 Description</label>
                <input type="text" id="python-script-desc" placeholder="Brief description of what this script does" style="
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    font-size: 0.85em;
                    background: rgba(255, 255, 255, 0.95);
                    color: #1D1D1F;
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                <button onclick="uploadPythonFile()" style="
                    flex: 1;
                    background: linear-gradient(135deg, #FF9500, #FFAD33);
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-size: 0.85em;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
                ">🐍 Upload Script</button>
                
                <button onclick="listPythonScriptsInProfile()" style="
                    background: rgba(255, 149, 0, 0.15);
                    color: #FF9500;
                    border: 1px solid rgba(255, 149, 0, 0.3);
                    padding: 10px 12px;
                    border-radius: 10px;
                    font-size: 0.8em;
                    font-weight: 600;
                    cursor: pointer;
                ">📁 View Scripts</button>
            </div>
            
            <div id="python-upload-status" style="min-height: 20px; color: #34C759; font-size: 0.8em; font-weight: 600;"></div>
        `;
        
        // Insert before API key section
        const apiSection = profileContent.querySelector('div[style*="rgba(0, 122, 255, 0.05)"]');
        if (apiSection) {
            profileContent.insertBefore(pythonSection, apiSection);
        } else {
            profileContent.appendChild(pythonSection);
        }
        
        // Add upload functionality
        setupPythonUploadHandlers();
    }
    
    function setupPythonUploadHandlers() {
        window.uploadPythonFile = function() {
            const fileInput = document.getElementById('python-file-upload');
            const nameInput = document.getElementById('python-script-name');
            const descInput = document.getElementById('python-script-desc');
            const statusDiv = document.getElementById('python-upload-status');
            
            const file = fileInput.files[0];
            const name = nameInput.value.trim();
            
            if (!file) {
                statusDiv.textContent = '❌ Please select a Python file';
                statusDiv.style.color = '#FF453A';
                return;
            }
            
            if (!name) {
                statusDiv.textContent = '❌ Please enter a script name';
                statusDiv.style.color = '#FF453A';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const code = e.target.result;
                const description = descInput.value.trim() || 'No description';
                
                try {
                    window.omegaPython.saveScript(name, code, description);
                    statusDiv.textContent = `✅ Script '${name}' uploaded successfully!`;
                    statusDiv.style.color = '#34C759';
                    
                    // Clear inputs
                    fileInput.value = '';
                    nameInput.value = '';
                    descInput.value = '';
                    
                    // Log to terminal
                    if (window.terminal) {
                        window.terminal.log(`✅ Python script '${name}' uploaded to profile`, 'success');
                        window.terminal.log(`💡 Use: python run ${name}`, 'info');
                    }
                    
                } catch (error) {
                    statusDiv.textContent = '❌ Failed to save script: ' + error.message;
                    statusDiv.style.color = '#FF453A';
                }
            };
            
            reader.readAsText(file);
        };
        
        window.listPythonScriptsInProfile = function() {
            if (window.terminal) {
                window.terminal.log('📁 Listing Python scripts from profile...', 'info');
                listPythonScripts();
            }
        };
    }
    
    // Initialize profile enhancement with better timing
    function initializeProfileEnhancement() {
        enhanceProfileWithPython();
        
        // Re-enhance when profile is opened
        if (window.openProfileCommand) {
            const originalOpenProfile = window.openProfileCommand;
            window.openProfileCommand = function() {
                originalOpenProfile();
                setTimeout(() => {
                    enhanceProfileWithPython();
                }, 500);
            };
        }
    }
    
    // Wait for profile system to be available
    if (window.openProfileCommand) {
        initializeProfileEnhancement();
    } else {
        const profileCheck = setInterval(() => {
            if (window.openProfileCommand) {
                initializeProfileEnhancement();
                clearInterval(profileCheck);
            }
        }, 1000);
        
        // Stop trying after 15 seconds
        setTimeout(() => {
            clearInterval(profileCheck);
        }, 15000);
    }
    
    console.log('✅ Python Integration System loaded successfully!');
    console.log('🐍 Use "python help" for available commands');
    
})();


