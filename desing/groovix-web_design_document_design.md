# Sonic Portal Design System

## Brand Identity
**Sonic Portal** is a high-end, futuristic music streaming platform that blends "Cyberpunk Luxury" with immersive glassmorphism. It is designed for audiophiles who crave a premium, neon-drenched aesthetic that departs from traditional streaming interfaces.

## Visual Language

### Colors
- **Surface**: `#081120` (Dark Navy) - The primary background for maximum contrast.
- **Primary**: `#00E5FF` (Electric Cyan) - Used for primary accents, active states, and branding.
- **Secondary**: `#8B5CF6` (Neon Purple) - Used for secondary highlights and gradients.
- **Highlight**: `#FF6B6B` (Soft Coral) - Reserved for critical actions like play buttons and active heart icons.
- **Glass**: `rgba(255, 255, 255, 0.05)` with `backdrop-blur: 20px` and `border: 1px solid rgba(255, 255, 255, 0.1)`.

### Typography
- **Primary Font**: Sora (Sans-serif)
- **Scale**:
  - **Headline**: 32px / Bold / Tracking -0.02em
  - **Title**: 20px / Semi-Bold
  - **Body**: 16px / Regular
  - **Label**: 12px / Medium / Uppercase / Tracking 0.05em

### UI Components

#### 1. Glass Cards
- **Radius**: 24px - 28px
- **Effects**: Subtle outer glow matching the accent color (cyan or purple).
- **Transparency**: Layered surfaces using container-lowest/low/high variables.

#### 2. Navigation
- **Top Bar**: Minimalist, centered branding in italicized uppercase.
- **Bottom Bar**: Floating glassmorphism design with a "Neon Glow" indicator for the active tab.

#### 3. Buttons
- **Primary Play Button**: Large, circular, Soft Coral (#FF6B6B) background with white icon.
- **Secondary Actions**: Ghost buttons or outline icons in Electric Cyan.

## Design Principles
- **Immersion**: High-quality imagery with gradient overlays.
- **Glow**: Use `box-shadow` or `drop-shadow` to simulate neon light on active elements.
- **Depth**: Clearly defined Z-index layers using blur and opacity rather than solid colors.
- **Hierarchy**: Bold headings and high contrast for metadata (Artist vs. Track).
