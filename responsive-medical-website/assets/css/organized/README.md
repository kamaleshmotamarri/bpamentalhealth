# Organized CSS Structure

This directory contains the organized CSS files split from the main `styles.css` file for better maintainability and organization.

## File Structure

### Core Styles (Load First)
- **01-variables.css** - CSS variables, typography, and responsive font sizes
- **02-base.css** - Base styles, reset, and HTML element defaults
- **03-theme.css** - Dark theme variables and theme-specific styles
- **04-layout.css** - Layout utilities (container, grid, section, etc.)

### Components
- **05-header.css** - Header and navigation styles
- **06-button.css** - Button component styles

### Page Sections
- **07-home.css** - Home section styles
- **08-delivery.css** - Delivery section styles
- **09-about.css** - About section styles
- **10-prices.css** - Prices section styles
- **11-gallery.css** - Gallery section styles
- **12-contact.css** - Contact section styles
- **13-contact-form.css** - Contact form styles
- **14-footer.css** - Footer styles

### UI Components
- **15-scroll.css** - Scroll bar and scroll up button
- **16-therapai.css** - TherapAI hero section
- **17-chatbot.css** - Chatbot component styles
- **18-disorders.css** - Mental health disorders section
- **19-disorder-modal.css** - Disorder information modal
- **20-resources.css** - Resources section styles

### Modals and Forms
- **22-auth.css** - Authentication modals (login/signup)
- **23-settings.css** - Settings modal
- **24-appointments.css** - Appointment scheduler

### Additional Pages
- **25-blog.css** - Blog page styles
- **26-testimonials.css** - Testimonials page styles
- **27-forum.css** - Forum/Community page styles
- **28-admin.css** - Admin portal styles

### Responsive Styles (Load Last)
- **21-responsive.css** - All responsive breakpoints and media queries

## Usage

### Option 1: Include All Files in HTML (Recommended for Performance)
Include all files in order in your HTML:
```html
<link rel="stylesheet" href="assets/css/organized/01-variables.css">
<link rel="stylesheet" href="assets/css/organized/02-base.css">
<!-- ... etc ... -->
```

### Option 2: Use Main Import File
Use `styles-organized.css` which imports all files:
```html
<link rel="stylesheet" href="assets/css/styles-organized.css">
```

## Notes

- Files are numbered to ensure correct loading order
- Responsive styles (21-responsive.css) must be loaded last
- The original `styles.css` is kept as a backup
- All styles have been preserved during the split

## Maintenance

When adding new styles:
1. Determine which file the new styles belong to
2. Add styles to the appropriate organized file
3. If creating a new section, create a new numbered file
4. Update this README if adding new files
