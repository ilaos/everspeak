# EVERSPEAK Color Scheme

## Brand Colors (Primary Palette)

```css
--color-dark-bg: #222831;       /* Darkest charcoal - main background */
--color-secondary-bg: #393E46;  /* Dark gray - panels, cards */
--color-sage: #948979;          /* Muted sage/olive - primary buttons, accents */
--color-cream: #DFD0B8;         /* Beige/cream - light surfaces, cards */
```

## Derived Colors

```css
/* Sage variations */
--color-sage-dark: #7d7464;     /* Darker sage - hover states */
--color-sage-darker: #6b6355;   /* Darkest sage - active states */

/* Cream variations */
--color-cream-light: #E8DDD0;   /* Lighter cream - borders */
--color-cream-dark: #C9BCA8;    /* Darker cream - subtle backgrounds */

/* Text colors */
--color-text-dark: #2c2822;     /* Dark brown - text on light backgrounds */
--color-text-light: #EEEEEE;    /* Light gray - text on dark backgrounds */
--color-text-muted: #8b7d6f;    /* Muted brown - secondary text */
```

## Semantic Colors (Minimal Use)

```css
--color-success: #5a9279;       /* Muted green - success states */
--color-error: #c85a54;         /* Muted red - errors, delete */
--color-warning: #d4a574;       /* Warm tan - warnings, highlights */
--color-info: #7891a8;          /* Muted blue - info states */
```

## Usage Guidelines

### Backgrounds
- **Page background:** Dark gradient (#222831 → #393E46)
- **Cards/Panels:** #DFD0B8 (cream)
- **Nested elements:** #E8DDD0 (light cream) or #393E46 (dark gray)
- **Sidebar:** #DFD0B8 (cream)

### Buttons
- **Primary:** #948979 (sage) → #7d7464 (hover) → #6b6355 (active)
- **Success:** #5a9279 (muted green)
- **Danger:** #c85a54 (muted red)
- **Info:** #7891a8 (muted blue)
- **Disabled:** #b8a899 (lighter sage)

### Text
- **On light backgrounds:** #2c2822 (dark brown)
- **On dark backgrounds:** #EEEEEE (light)
- **Secondary text:** #8b7d6f (muted)
- **Links/Accents:** #948979 (sage)

### Borders
- **Light surfaces:** #C9BCA8 (dark cream)
- **Dark surfaces:** #4a5058 (light gray)
- **Accent borders:** #948979 (sage)

### Special Elements
- **Modals:** White background with #222831 overlay (50% opacity)
- **Hover states:** Lighten/darken by 8-10%
- **Active states:** Darken by 15-20%
- **Focus rings:** #948979 with 10% opacity

## Removed Colors

These colors were replaced with brand palette:
- ❌ #3498db (bright blue) → #7891a8 (muted blue) or #948979 (sage)
- ❌ #2c3e50 (blue-gray) → #2c2822 (dark brown)
- ❌ #7f8c8d (gray) → #8b7d6f (muted brown)
- ❌ #e8eef5 (light blue-gray) → #E8DDD0 (light cream)
- ❌ #f8f9fb (light blue-white) → #E8DDD0 (light cream)
- ❌ #667eea, #764ba2 (purple) → #948979 (sage) gradients
- ❌ #f093fb, #f5576c (pink) → #d4a574 (warm tan)
- ❌ Random greens, blues, purples → Unified brand colors
