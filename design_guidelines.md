# Reminder App Design Guidelines

## Design Approach

**Selected Approach:** Modern Productivity System  
**Primary Inspiration:** Linear, Todoist, and Notion  
**Rationale:** This reminder app is a utility-focused productivity tool requiring clarity, efficiency, and intuitive workflows. Drawing from best-in-class productivity applications ensures familiar patterns while maintaining a polished, professional aesthetic.

**Core Design Principles:**
1. Clarity over decoration - every element serves a purpose
2. Generous whitespace for breathing room and focus
3. Clear visual hierarchy guiding user attention
4. Smooth, purposeful micro-interactions (minimal, not distracting)
5. Mobile-first responsive design

## Typography System

**Font Family:** 
- Primary: Inter (via Google Fonts CDN)
- Headings: Inter with tighter letter-spacing (-0.02em)

**Type Scale:**
- Page Title (H1): text-4xl, font-bold, tracking-tight
- Section Headers (H2): text-2xl, font-semibold
- Card Titles (H3): text-lg, font-semibold
- Body Text: text-base, font-normal
- Small Text/Metadata: text-sm, font-medium
- Micro Text (timestamps): text-xs

## Layout & Spacing System

**Container Strategy:**
- Max width: max-w-7xl for main content
- Auth pages: max-w-md centered
- Dashboard: max-w-6xl with sidebar layout

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16  
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (between elements)
- Section spacing: p-8, py-12, py-16 (between sections)
- Generous spacing: p-16, py-20 (major sections)

**Grid System:**
- Dashboard: Two-column layout (sidebar + main content)
- Reminder cards: Single column stack on mobile, 2 columns on tablet (md:grid-cols-2)
- Settings: Single column max-w-2xl for optimal form width

## Component Library

### Navigation
**App Header:**
- Fixed top navigation with backdrop blur
- Logo/brand on left, user menu on right
- h-16 height with px-6 horizontal padding
- Navigation items use text-sm font-medium

**Sidebar Navigation (Dashboard):**
- w-64 fixed sidebar on desktop
- Collapsible hamburger menu on mobile
- Icon + label navigation items with subtle hover states
- Active state with border-l-2 indicator

### Authentication Components

**Sign Up / Login Forms:**
- Centered card layout with max-w-md
- Form card with p-8 padding and rounded-xl
- Input fields with h-12 height, px-4 padding
- Labels above inputs (text-sm font-medium mb-2)
- Primary CTA button at full width (w-full)
- Secondary links below form (text-sm)
- Social proof text above form ("Join 10,000+ users")

**Form Inputs:**
- Standard height: h-12
- Border radius: rounded-lg
- Padding: px-4
- Focus ring with ring-2 offset pattern
- Error states with text-sm text below input
- Icon prefix support (pl-12 when icon present)

### Dashboard Components

**Reminder Cards:**
- rounded-xl with p-6 padding
- Shadow: shadow-sm with hover:shadow-md transition
- Grid layout on desktop (grid-cols-2 gap-6)
- Stack on mobile
- Card header with flex justify-between
- Icon indicators for notification method (text-xl size using Heroicons)
- Timestamp in text-xs at card bottom
- Action buttons (Edit/Delete) in top-right, text-sm

**Create/Edit Reminder Modal:**
- Full-screen overlay with centered modal
- Modal: max-w-2xl, rounded-2xl, p-8
- Form fields stacked with gap-6
- Date/time pickers with proper spacing
- Notification method selector as radio cards (grid-cols-3)
- Submit button at bottom right
- Cancel link on left

**Quick Add Button (FAB):**
- Fixed bottom-right positioning (bottom-8 right-8)
- Large circular button (h-16 w-16)
- Prominent shadow (shadow-lg)
- Plus icon (text-2xl)

### Data Display Components

**Reminder List View:**
- Clean list with divide-y separator
- Each item: py-4 padding
- Checkbox on left, content in middle, actions on right
- Hover state with subtle background transition
- Completed reminders with opacity-60

**Notification History:**
- Timeline layout with left border indicator
- Each entry with pb-8 spacing
- Icon badge for notification type
- Timestamp and status in text-sm
- Expandable details with slide-down animation

**Category/Tag Pills:**
- Inline-flex with px-3 py-1
- rounded-full shape
- text-xs font-medium
- Multiple tags with gap-2 spacing

### Profile & Settings

**Profile Section:**
- Two-column layout (md:grid-cols-2)
- Avatar on left (h-24 w-24 rounded-full)
- User info on right
- Phone number input with country code dropdown
- Notification preferences as toggle switches

**Settings Cards:**
- Stacked cards with gap-6
- Each card: p-6, rounded-xl
- Section header (text-lg font-semibold mb-4)
- Form controls properly spaced (space-y-4)

### Buttons & Actions

**Button Hierarchy:**
- Primary CTA: px-6 py-3, rounded-lg, font-medium
- Secondary: px-4 py-2, rounded-lg, font-medium
- Text buttons: px-3 py-2, font-medium
- Icon buttons: p-2, rounded-lg

**Button States:**
- All buttons include hover and active states
- Disabled state with opacity-50 and cursor-not-allowed
- Loading state with spinner icon

## Responsive Breakpoints

**Mobile (< 768px):**
- Single column layouts
- Sidebar collapses to hamburger menu
- Cards stack vertically
- FAB remains bottom-right
- Reduced padding (p-4 instead of p-8)

**Tablet (768px - 1024px):**
- Two-column card grids where appropriate
- Sidebar visible but narrower (w-48)
- Comfortable spacing maintained

**Desktop (> 1024px):**
- Full sidebar navigation (w-64)
- Multi-column layouts enabled
- Maximum content width enforced (max-w-7xl)
- Generous spacing throughout

## Icons

**Icon Library:** Heroicons (via CDN)  
**Usage:**
- Navigation: w-5 h-5
- Card headers: w-6 h-6
- Buttons: w-5 h-5
- Notification method indicators: w-8 h-8
- Consistent stroke-width across all icons

## Animation Strategy

**Purposeful Micro-Interactions:**
- Modal enter/exit: scale and fade (200ms)
- Card hover: subtle lift (shadow transition 150ms)
- Button hover: slight scale (transform 100ms)
- Form validation: shake animation for errors
- Success states: checkmark fade-in
- NO scroll-triggered animations
- NO page transition effects

## Empty States

**No Reminders:**
- Centered illustration placeholder (max-w-xs)
- Heading text-2xl font-semibold
- Description text-base
- Primary CTA button below

**No Notification History:**
- Icon placeholder (text-6xl)
- Helpful message explaining feature

## Accessibility Implementation

- All interactive elements keyboard accessible (tab order)
- Focus indicators visible and clear (ring-2 ring-offset-2)
- Form inputs with proper labels and error messages
- ARIA labels for icon-only buttons
- Sufficient contrast ratios throughout
- Screen reader friendly status updates

## Images

**Profile Avatar Placeholder:**
- Location: User profile section and top-right navigation
- Description: Circular gradient placeholder or user initials
- Size: Large version (h-24 w-24), small version (h-10 w-10)

**Empty State Illustrations:**
- Location: Dashboard when no reminders exist
- Description: Simple line illustration of a calendar or bell icon
- Style: Minimal, single-tone vector graphic
- Size: max-w-xs centered

**No hero image required** - This is a productivity application focused on functionality over visual marketing.