# No Emojis Policy

**Effective Date:** Current  
**Status:** ✅ ACTIVE

## Policy

**DO NOT use emojis in any build or production code.** Always use SVG icons instead.

## Rationale

1. **Consistency**: SVG icons provide consistent appearance across all platforms and browsers
2. **Customization**: SVG icons can be styled with CSS variables and themes
3. **Accessibility**: SVG icons are more accessible and can include proper ARIA labels
4. **Professional**: SVG icons maintain a professional, technical aesthetic
5. **Performance**: SVG icons are lightweight and scale perfectly at any size

## Implementation

### Use SVG Icons Instead

**❌ DON'T:**
```typescript
context.log("⚡ Welcome to Omega Terminal", "info");
context.log("💡 Quick Start", "info");
context.log("❌ Usage Error", "error");
```

**✅ DO:**
```typescript
import { SVG_ICONS } from "@/lib/utils/svg-icons";

const welcomeHtml = `
  <div>
    ${SVG_ICONS.lightning}
    Welcome to Omega Terminal
  </div>
`;
context.logHtml(welcomeHtml);
```

### Available SVG Icons

Located in `src/lib/utils/svg-icons.ts`:

- **Status Icons**: `error`, `success`, `warning`, `info`
- **Action Icons**: `lightning`, `rocket`, `lightbulb`
- **Feature Icons**: `globe`, `chart`, `palette`
- **Media Icons**: `music`, `search`, `wallet`

### Creating New Icons

1. Add the SVG icon to `src/lib/utils/svg-icons.ts`
2. Use consistent styling (stroke-width="2", stroke-linecap="round")
3. Use `currentColor` for stroke/fill to inherit text color
4. Include proper viewBox and dimensions

### Inline SVG for One-Time Use

For one-time use cases, you can define inline SVG:

```typescript
const icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
  <path d="..."></path>
</svg>`;
```

## Enforcement

- All command outputs must use SVG icons
- All UI components must use SVG icons
- All terminal messages must use SVG icons
- Code reviews should flag any emoji usage

## Migration

Existing emoji usage should be gradually migrated to SVG icons. Priority:

1. **High Priority**: Command outputs, error messages, welcome messages
2. **Medium Priority**: UI components, status indicators
3. **Low Priority**: Internal logging, debug messages

## Resources

- SVG Icons: `src/lib/utils/svg-icons.ts`
- Icon Library: Feather Icons (https://feathericons.com/) - compatible format
- Helper Functions: `getSVGIcon()` for custom styling

