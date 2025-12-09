const fs = require('fs');
const path = require('path');

const commandsDir = './src/lib/commands';
const files = fs.readdirSync(commandsDir).filter(f => 
  f.endsWith('.ts') && 
  !f.includes('.test.') && 
  !f.includes('CommandRegistry') && 
  !f.includes('command-output-helpers') && 
  !f.includes('network-helpers') && 
  !f.includes('chaingpt-styling') &&
  !f.includes('api.ts')
);

const allCommands = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
    
    // Match command definitions
    const commandRegex = /export const (\w+Command|[\w]+Commands):\s*Command\s*=\s*\{([\s\S]*?)\};/g;
    let match;
    
    while ((match = commandRegex.exec(content)) !== null) {
      const commandBlock = match[2];
      
      // Extract name
      const nameMatch = commandBlock.match(/name:\s*['"]([^'"]+)['"]/);
      if (!nameMatch) continue;
      const name = nameMatch[1];
      
      // Extract description
      const descMatch = commandBlock.match(/description:\s*['"]([^'"]*)['"]/);
      const desc = descMatch ? descMatch[1] : '';
      
      // Extract aliases
      const aliasesMatch = commandBlock.match(/aliases:\s*\[([^\]]*)\]/);
      let aliases = [];
      if (aliasesMatch) {
        aliases = aliasesMatch[1]
          .split(',')
          .map(a => a.trim().replace(/['"]/g, ''))
          .filter(a => a);
      }
      
      // Extract usage
      const usageMatch = commandBlock.match(/usage:\s*['"]([^'"]*)['"]/);
      const usage = usageMatch ? usageMatch[1] : '';
      
      // Extract category
      const categoryMatch = commandBlock.match(/category:\s*['"]([^'"]*)['"]/);
      const category = categoryMatch ? categoryMatch[1] : '';
      
      allCommands.push({
        file: file.replace('.ts', ''),
        name,
        description: desc,
        aliases,
        usage,
        category
      });
    }
    
    // Also check for command arrays (like basicCommands, walletCommands, etc.)
    const arrayRegex = /export const (\w+Commands):\s*Command\[\]\s*=\s*\[([\s\S]*?)\];/g;
    while ((match = arrayRegex.exec(content)) !== null) {
      // These are arrays, we'll handle them separately if needed
    }
  } catch(e) {
    console.error(`Error processing ${file}:`, e.message);
  }
});

// Group by category
const byCategory = {};
allCommands.forEach(cmd => {
  const cat = cmd.category || 'uncategorized';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(cmd);
});

console.log(JSON.stringify({ commands: allCommands, byCategory }, null, 2));

