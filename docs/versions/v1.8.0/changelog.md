# Language Learning Buddy v1.8.0

## What's New

- **Settings Page**: Added a new settings page allowing users to configure their preferences for points and context features
- **User Settings Management**: Implemented user settings management system to enable or disable points and context features
- **Frontend Design Improvements**: Enhanced header component with dropdown menu and improved theme toggle functionality

## Fixed

- **Security**: Enhanced security for user settings RPC functions
- **Theme Toggle**: Improved theme toggle logic in HeaderComponent for better user experience with authentication status handling

## Changed

- **Gamification Logic**: Updated gamification logic to respect user settings for points awarding
- **AnalysisForm and AnalyzeView**: Updated components to conditionally render based on user settings
- **E2E Tests**: Enhanced test selectors and user interactions, added support for `data-test-id` attributes in Playwright configuration
