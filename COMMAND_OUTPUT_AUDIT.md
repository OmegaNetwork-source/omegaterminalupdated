# Command Output Uniformity Audit Report

## Overview
This document tracks the audit and standardization of all command outputs to ensure uniformity and clickable command functionality across all commands.

## Standard Format Requirements

All clickable commands in outputs must include:
1. `class="omega-help-command"` - Required for click handling
2. `data-command="<command>"` - The full command string to input
3. Standard styling matching help command:
   - `color: var(--palette-secondary, #00ff88)`
   - `font-weight: bold`
   - `font-size: 1.05em`
   - `font-family: 'Courier New', monospace`
   - `text-shadow: 0 0 6px rgba(0, 255, 136, 0.3)`
   - `cursor: pointer`
   - `display: inline-block`
   - `padding: 2px 4px`
   - `border-radius: 3px`
   - `transition: all 0.2s ease`
   - `user-select: none`
4. Hover effects:
   - `onmouseover`: Background and enhanced text-shadow
   - `onmouseout`: Reset to default
5. `title="Click to add '<command>' to terminal input"` - Tooltip

## Helper Functions Available

Located in `src/lib/commands/command-output-helpers.ts`:
- `createClickableCommand()` - Creates clickable command span
- `createClickableCommandLine()` - Creates command with line wrapper
- `createClickableCommandBlock()` - Creates standalone command block
- `createHelpOutput()` - Creates help container with title
- `createHelpTextLine()` - Creates standard text line
- `createEmptyLine()` - Creates empty spacer

## Audit Status

### ✅ Fully Compliant Commands
These commands have complete, uniform styling with all required properties:

1. **basic.ts** - Help command (reference implementation)
2. **kalshi.ts** - Full styling with hover effects
3. **hyperliquid.ts** - Full styling with hover effects
4. **polymarket.ts** - Full styling with hover effects
5. **chaingpt-chat.ts** - Uses clickable commands
6. **chaingpt-contract.ts** - Uses clickable commands
7. **chaingpt-auditor.ts** - Uses clickable commands
8. **chaingpt-nft.ts** - Uses clickable commands
9. **games.ts** - Uses clickable commands (custom styling but functional)

### ⚠️ Partially Compliant Commands
These commands have clickable commands but are missing some styling properties:

1. **pgt.ts** - ✅ UPDATED - Now has full styling + usage examples
2. **dexscreener.ts** - ✅ UPDATED - Now has full styling
3. **defillama.ts** - ✅ UPDATED - Now has full styling

### ❌ Commands Needing Updates
These commands output command examples but they are NOT clickable:

1. **farm.ts** - ✅ UPDATED - Full HTML conversion
2. **bot.ts** - ✅ UPDATED - Full HTML conversion
3. **rome.ts** - ✅ UPDATED - Full HTML conversion
4. **fair.ts** - ✅ UPDATED - Full HTML conversion
5. **aptos.ts** - May need review
6. **solana.ts** - May need review
7. **near.ts** - May need review
8. **eclipse.ts** - May need review
9. **eth.ts** - May need review
10. **monad.ts** - May need review
11. **network.ts** - May need review
12. **wallet.ts** - May need review
13. **mining.ts** - May need review
14. **markets.ts** - May need review
15. **news.ts** - May need review
16. **youtube.ts** - May need review
17. **spotify.ts** - May need review
18. **referral.ts** - May need review
19. **mixer.ts** - May need review
20. **token-factory.ts** - May need review
21. **terminal-builder.ts** - May need review
22. **profile.ts** - May need review
23. **opensea.ts** - May need review
24. **nft-mint.ts** - May need review
25. **magiceden.ts** - May need review
26. **ens.ts** - May need review
27. **email.ts** - May need review
28. **chatter.ts** - May need review
29. **alphavantage.ts** - May need review
30. **perps.ts** - May need review
31. **color.ts** - May need review
32. **chart.ts** - May need review
33. **entertainment.ts** - May need review
34. **alpha.ts** - May need review
35. **portfolio.ts** - May need review
36. **context.ts** - May need review
37. **format.ts** - May need review
38. **social.ts** - May need review
39. **export.ts** - May need review
40. **whoami.ts** - May need review
41. **game-arena.ts** - May need review
42. **faction.ts** - May need review
43. **screensaver.ts** - May need review
44. **funky.ts** - May need review
45. **tech.ts** - May need review
46. **lofi.ts** - May need review
47. **blues.ts** - May need review
48. **trance.ts** - May need review
49. **melodies.ts** - May need review
50. **airdrop.ts** - May need review
51. **api.ts** - May need review

## Implementation Strategy

### Phase 1: High Priority Commands (Done)
- ✅ Updated dexscreener.ts - Enhanced styling
- ✅ Updated defillama.ts - Enhanced styling  
- ✅ Updated pgt.ts - Enhanced styling + usage examples
- ✅ Updated farm.ts - Full HTML conversion with clickable commands
- ✅ Updated bot.ts - Full HTML conversion with clickable commands
- ✅ Updated rome.ts - Full HTML conversion with clickable commands
- ✅ Updated fair.ts - Full HTML conversion with clickable commands

### Phase 2: Medium Priority Commands
Commands that frequently show command examples:
- farm.ts
- bot.ts
- rome.ts
- wallet.ts
- mining.ts

### Phase 3: Low Priority Commands
Commands with minimal command examples or help outputs:
- All other commands in the list

## Notes

1. Commands that use `context.log()` for help should be converted to HTML output with clickable commands
2. Commands that already use HTML but don't have clickable commands should be updated
3. All command examples in outputs should be clickable
4. The helper functions in `command-output-helpers.ts` should be used for consistency

## Testing Checklist

For each updated command:
- [ ] Commands in output are clickable
- [ ] Clicking a command populates terminal input
- [ ] Hover effects work correctly
- [ ] Styling matches help command format
- [ ] Tooltips show correct command text
- [ ] Works in both basic and dashboard views

