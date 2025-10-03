# Black-Cross Frontend - Responsive Design Guide

## Overview

The Black-Cross frontend implements a mobile-first, responsive design approach that ensures seamless user experience across all device sizes from smartphones to large desktop monitors.

## Design Philosophy

### Mobile-First Approach
- Start with mobile layout and progressively enhance for larger screens
- Touch-friendly interactive elements (minimum 44x44 pixels)
- Optimized content hierarchy for small screens
- Performance-optimized for mobile networks

### Flexible Grid System
Material-UI's Grid system with 12-column layout provides responsive flexibility across all breakpoints.

## Breakpoints

### Standard Breakpoints (Material-UI)

| Breakpoint | Size | Device Type | Example Devices |
|------------|------|-------------|-----------------|
| **xs** | 0px - 599px | Extra small (Mobile) | iPhone SE, Galaxy S |
| **sm** | 600px - 899px | Small (Tablet) | iPad Mini, Kindle |
| **md** | 900px - 1199px | Medium (Small Desktop) | iPad Pro, Small laptops |
| **lg** | 1200px - 1535px | Large (Desktop) | Standard monitors |
| **xl** | 1536px+ | Extra large (Large Desktop) | 4K monitors, wide screens |

### Usage in Code

```tsx
import { Box, Grid } from '@mui/material';

// Responsive Box
<Box sx={{
  width: '100%',           // Mobile: 100%
  width: { sm: '75%' },    // Tablet: 75%
  width: { md: '50%' },    // Desktop: 50%
  p: { xs: 2, md: 4 },     // Padding: 16px mobile, 32px desktop
}} />

// Responsive Grid
<Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Content */}
  </Grid>
</Grid>
```

## Layout Components

### Navigation (Sidebar/Drawer)

#### Mobile (xs - 599px)
- **Temporary Drawer**: Slides in from left, overlays content
- **Toggle Button**: Hamburger menu in AppBar
- **Full-screen Menu**: When open, takes full screen
- **Touch Gestures**: Swipe to close

#### Tablet/Desktop (600px+)
- **Permanent Drawer**: Always visible, fixed 260px width
- **Content Adjustment**: Main content shifts to accommodate drawer
- **No Toggle Button**: Drawer is always visible

```tsx
// Implementation in Layout.tsx
<Drawer
  variant="temporary"        // Mobile
  open={mobileOpen}
  onClose={handleDrawerToggle}
  sx={{ display: { xs: 'block', sm: 'none' } }}
/>

<Drawer
  variant="permanent"        // Desktop
  sx={{ display: { xs: 'none', sm: 'block' } }}
/>
```

### AppBar (Top Navigation)

#### Mobile (xs)
- Full width
- Hamburger menu button visible
- Compact title
- User menu icon

#### Desktop (sm+)
- Width adjusts for permanent drawer: `calc(100% - 260px)`
- No hamburger menu
- Full title displayed
- User menu icon

### Main Content Area

#### Responsive Padding
```tsx
<Box component="main" sx={{
  p: { xs: 2, sm: 3, md: 4 },  // 16px, 24px, 32px
  width: { sm: `calc(100% - 260px)` },
}} />
```

## Responsive Components

### Dashboard Statistics Cards

#### Mobile (xs)
- 1 card per row (12 columns)
- Stacked vertically
- Reduced padding

#### Tablet (sm)
- 2 cards per row (6 columns each)
- Moderate padding

#### Desktop (md+)
- 3-4 cards per row (3-4 columns each)
- Full padding and spacing

```tsx
<Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard {...props} />
  </Grid>
  {/* More cards */}
</Grid>
```

### Data Tables

#### Mobile (xs)
- Card-based layout (instead of table)
- Vertical stacking of information
- Horizontal scrolling for wide tables
- Key information prioritized

#### Tablet (sm+)
- Standard table layout
- All columns visible
- Pagination controls

```tsx
<TableContainer sx={{
  // Enable horizontal scroll on mobile
  overflowX: { xs: 'auto', sm: 'visible' }
}}>
  <Table size={{ xs: 'small', md: 'medium' }} />
</TableContainer>
```

### Forms

#### Mobile (xs)
- Single column layout
- Full-width inputs
- Larger touch targets
- Stacked buttons

#### Desktop (sm+)
- Multi-column layout where appropriate
- Grouped related fields
- Inline buttons

```tsx
<Grid container spacing={2}>
  <Grid item xs={12} sm={6}>
    <TextField fullWidth {...props} />
  </Grid>
  <Grid item xs={12} sm={6}>
    <TextField fullWidth {...props} />
  </Grid>
</Grid>
```

### Modals & Dialogs

#### Mobile (xs)
- Full-screen or nearly full-screen
- Bottom sheet style for simple actions
- Easy-to-tap close buttons

#### Desktop (sm+)
- Centered dialogs
- Maximum width constraints
- Overlay with backdrop

```tsx
<Dialog
  fullScreen={isMobile}  // useMediaQuery('(max-width:600px)')
  maxWidth="md"
  fullWidth
>
  {/* Dialog content */}
</Dialog>
```

## Typography Scaling

### Responsive Font Sizes

```tsx
// Automatically scales based on viewport
<Typography 
  variant="h1" 
  sx={{ 
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
  }}
/>
```

### Variant Mapping

| Variant | Mobile (xs) | Tablet (sm) | Desktop (md+) |
|---------|-------------|-------------|---------------|
| h1 | 2rem (32px) | 2.5rem (40px) | 3rem (48px) |
| h2 | 1.75rem | 2rem | 2.5rem |
| h3 | 1.5rem | 1.75rem | 2rem |
| h4 | 1.25rem | 1.5rem | 1.75rem |
| body1 | 1rem | 1rem | 1rem |
| body2 | 0.875rem | 0.875rem | 0.875rem |

## Testing Responsive Design

### Browser DevTools

**Chrome/Edge:**
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Click Device Toolbar icon or press `Ctrl+Shift+M`
3. Select device from dropdown or set custom dimensions

**Common Test Devices:**
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- iPad Pro (1024x1366)
- Desktop (1920x1080)

### Manual Testing

#### Mobile Testing (xs)
```bash
# Resize browser to 375px width
- Test navigation drawer toggle
- Verify all buttons are tappable
- Check horizontal scrolling
- Test form inputs with mobile keyboard
- Verify content doesn't overflow
```

#### Tablet Testing (sm)
```bash
# Resize browser to 768px width
- Test drawer transitions
- Verify 2-column layouts
- Check navigation usability
- Test landscape and portrait modes
```

#### Desktop Testing (md+)
```bash
# Resize browser to 1920px width
- Test permanent drawer
- Verify multi-column layouts
- Check hover states
- Test keyboard navigation
```

### Automated Testing

```bash
# Lighthouse responsive audit
lighthouse http://localhost:3000 --preset=desktop
lighthouse http://localhost:3000 --preset=mobile

# BrowserStack for real device testing
# https://www.browserstack.com/
```

## Common Responsive Patterns

### Hide/Show Elements

```tsx
// Show only on mobile
<Box sx={{ display: { xs: 'block', sm: 'none' } }}>
  Mobile only content
</Box>

// Hide on mobile, show on desktop
<Box sx={{ display: { xs: 'none', sm: 'block' } }}>
  Desktop only content
</Box>
```

### Responsive Spacing

```tsx
<Box sx={{
  mt: { xs: 2, sm: 3, md: 4 },  // Margin top
  p: { xs: 2, sm: 3, md: 4 },   // Padding
  gap: { xs: 1, sm: 2, md: 3 }, // Gap in flex/grid
}} />
```

### Responsive Columns

```tsx
<Grid container spacing={2}>
  {/* 1 col mobile, 2 col tablet, 3 col desktop */}
  <Grid item xs={12} sm={6} md={4}>
    <Card />
  </Grid>
</Grid>
```

### Responsive Images

```tsx
<Box
  component="img"
  sx={{
    width: { xs: '100%', sm: 'auto' },
    maxWidth: '100%',
    height: 'auto',
  }}
  src="image.jpg"
  alt="Description"
/>
```

## Performance Considerations

### Mobile Performance

1. **Lazy Loading**: Non-critical images load on-demand
2. **Code Splitting**: Feature pages load only when accessed
3. **Reduced Animations**: Respect `prefers-reduced-motion`
4. **Optimized Images**: Use WebP with appropriate sizes
5. **Minimal JavaScript**: Vendor chunks loaded in parallel

### Network Optimization

```tsx
// Responsive images with srcset
<img
  src="image-medium.jpg"
  srcSet="
    image-small.jpg 375w,
    image-medium.jpg 768w,
    image-large.jpg 1920w
  "
  sizes="
    (max-width: 600px) 375px,
    (max-width: 1200px) 768px,
    1920px
  "
  alt="Responsive image"
/>
```

## Common Responsive Issues & Solutions

### Issue: Content Overflows on Mobile
**Solution:**
```tsx
<Box sx={{ 
  overflow: 'auto',
  maxWidth: '100vw',
  wordBreak: 'break-word',
}} />
```

### Issue: Tables Too Wide for Mobile
**Solution:**
```tsx
<TableContainer sx={{ 
  overflowX: 'auto',
  maxWidth: '100vw',
}} />
```

### Issue: Fixed-Width Elements
**Solution:**
```tsx
// Use relative units instead of fixed pixels
<Box sx={{ 
  width: { xs: '100%', sm: 600, md: 800 },
  maxWidth: '100%',
}} />
```

### Issue: Touch Targets Too Small
**Solution:**
```tsx
// Minimum 44x44 pixels for touch targets
<IconButton sx={{ 
  minWidth: 44,
  minHeight: 44,
}} />
```

## Best Practices

### ✅ DO

1. **Test on Real Devices**: Emulators are good, but test on actual phones/tablets
2. **Use Relative Units**: Prefer `rem`, `em`, `%` over `px`
3. **Mobile-First CSS**: Start with mobile styles, add desktop with media queries
4. **Touch-Friendly**: Minimum 44x44px touch targets
5. **Flexible Layouts**: Use flex and grid for fluid layouts
6. **Performance**: Optimize for slower mobile networks
7. **Progressive Enhancement**: Core features work on all devices

### ❌ DON'T

1. **Don't Use Fixed Widths**: Avoid `width: 500px` without max-width
2. **Don't Hide Critical Content**: Mobile users need all features
3. **Don't Ignore Landscape**: Test both portrait and landscape
4. **Don't Rely on Hover**: Mobile devices don't have hover states
5. **Don't Use Small Fonts**: Minimum 16px to prevent zoom on iOS
6. **Don't Forget Touch**: Ensure all interactions work with touch
7. **Don't Ignore Performance**: Mobile users have limited bandwidth

## Accessibility & Responsive Design

### Zoom Support

The application supports browser zoom up to 200% while maintaining usability:

```css
/* Viewport meta tag allows zoom */
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Text Reflow

Text reflows appropriately at different zoom levels and viewport sizes without requiring horizontal scrolling.

### Orientation Support

Application works in both portrait and landscape orientations with appropriate layout adjustments.

## Device-Specific Considerations

### iOS Safari
- Respects safe areas with `env(safe-area-inset-*)`
- Handles virtual keyboard appearance
- Avoids zoom on input focus with 16px minimum font size

### Android Chrome
- Addresses bar auto-hides on scroll
- Handles various screen densities
- Supports system-level font scaling

### Tablets
- Utilizes available screen real estate
- Provides desktop-like experience where appropriate
- Maintains touch-friendly interactions

## Resources

### Tools
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [BrowserStack](https://www.browserstack.com/) - Real device testing

### Material-UI Documentation
- [Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [Grid System](https://mui.com/material-ui/react-grid/)
- [Box Component](https://mui.com/material-ui/react-box/)

### Guidelines
- [Google Material Design - Responsive Layout](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)

## Support

For responsive design issues:
1. Test on multiple devices/browsers
2. Check browser DevTools device emulation
3. Verify Material-UI breakpoint usage
4. Consult this guide for patterns
5. File an issue with screenshots from different devices

Last Updated: 2024
