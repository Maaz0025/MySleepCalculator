Sleep Calculator
Overview
The Sleep Calculator is a responsive web application designed to help users optimize their sleep schedules based on 90-minute sleep cycles and age-appropriate sleep recommendations. The application provides personalized sleep and wake time suggestions by considering the user's age group and preferred scheduling mode (wake up time or bedtime). It features an educational blog section, contact forms, and comprehensive information pages about sleep health and wellness.

User Preferences
Preferred communication style: Simple, everyday language.System Architecture
Frontend Architecture
Static Website: Built with vanilla HTML5, CSS3, and JavaScript
Responsive Design: Mobile-first approach with hamburger navigation for smaller screens
Component Structure: Modular page-based architecture with shared header/footer components
Styling Approach: Custom CSS with gradient backgrounds, card-based layouts, and consistent visual theming

Core Functionality
Sleep Cycle Calculator: JavaScript-based calculation engine using 90-minute sleep cycles
Age-Based Recommendations: Predefined sleep duration ranges for different age groups (0-3 months to 65+ years)
Interactive UI: Age selection buttons, schedule mode toggles, and time input controls
Dynamic Results: Real-time calculation and display of optimal sleep/wake timesPage Architecture
Home Page (index.html): Primary calculator interface with age selection and time input
Blog Section: Article listing with placeholder content for sleep-related topics
Static Pages: About, Contact, Privacy Policy, and Terms & Conditions
Navigation: Consistent header navigation with mobile-responsive hamburger menu
Data Management
Client-Side Storage: All calculations and user selections handled in browser memory
No Database: Currently operates without persistent data storage
Configuration Data: Sleep recommendations stored as JavaScript objects
Styling System
CSS Architecture: Single stylesheet (style.css) with component-specific styles
Design System: Dark blue gradient theme with consistent spacing and typography
Responsive Breakpoints: Mobile-first design with hamburger navigation for smaller screens
Visual Elements: Custom SVG graphics for blog post placeholders and sleep-themed icons
External Dependencies
Third-Party Services
Analytics: Mentions Google Analytics integration (not currently implemented)
Advertising: References to AdSense for potential monetization
Email: Contact form references email functionality (static form, no backend processing)
Browser APIs
DOM Manipulation: Standard JavaScript DOM APIs for interactive elements
Local Storage: Potential for storing user preferences (not currently implemented)
Responsive Design: CSS media queries for cross-device compatibility
External Resources
Fonts: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
Icons: Unicode emoji characters for visual elements (🌙)
No External Libraries: Pure vanilla JavaScript implementation without frameworks or libraries