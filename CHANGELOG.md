# Changelog

All notable changes to the CyberGrandpa Anti-Fraud Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Development-aware logger utility that only logs in development mode
- Comprehensive project plan (plan.md) with roadmap and priorities
- CHANGELOG.md to track project changes

### Changed
- Replaced all console.log/error statements with proper logger utility
- Updated CLAUDE.md to reflect actual architecture (WXT storage instead of LokiJS)
- Updated CLAUDE.md to reflect 28 supported languages (previously listed only 7)

### Improved
- Code quality by removing debug console statements from production code
- Documentation accuracy regarding technology stack

## [0.0.3] - 2025-11-23

### Changed
- Moved public assets from src/public to public directory
- Updated web accessible resources configuration
- Upgraded bun package manager from 1.1.0 to 1.2.15

### Fixed
- Added type imports and handle optional tab properties in popup scanning
- Enhanced type safety in logo component
- Improved type handling in compress-readable-stream utility
- Updated import path for ContentScriptContext

### Documentation
- Renamed .cursorrules to .windsurfrules
- Removed formatting rules from configuration
- Enhanced internationalization support with new localization files
- Added development notes for CyberGrandpa AntiFraud extension
- Expanded .cursorrules with detailed component patterns and guidelines
- Updated .cursorrules and CLAUDE.md for clarity and structure

### Development
- Updated dev dependencies including Svelte, TypeScript and ESLint packages
- Enhanced TypeScript configuration for improved type safety and modern features
- Added environment configuration for snapshot updates

## [0.0.2] - Earlier Release

### Features
- Core URL blocking system with compressed blocklist storage
- Automatic sync every 11 hours from hblock.molinero.dev/hosts
- Cross-context proxy service architecture
- webNavigation-based blocking

### UI Components
- Extension popup with protection status and manual scanning
- Options page for settings management
- Onboarding wizard for first-run experience
- 11 reusable Svelte 5 components using runes syntax

### Internationalization
- Support for 28 languages
- YAML-based locale files
- Browser-specific help screenshots (6 languages)

### Infrastructure
- Manifest V3 compliant
- Firefox-specific build pipeline
- WXT storage API integration
- Svelte store bindings

## [0.0.1] - Initial Release

### Added
- Initial project setup with WXT framework
- Svelte 5 with runes syntax
- Cross-browser support (Chrome, Firefox)
- Basic URL blocking functionality
- Storage management with WXT API
- Internationalization infrastructure

---

## Version History Notes

### Versioning Strategy
- **MAJOR** version for incompatible API changes
- **MINOR** version for added functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes

### Release Schedule
- Development releases: As needed
- Stable releases: Following thorough testing and QA

[Unreleased]: https://github.com/xdemocle/cybergrandpa-web-extension-antifraud/compare/v0.0.3...HEAD
[0.0.3]: https://github.com/xdemocle/cybergrandpa-web-extension-antifraud/releases/tag/v0.0.3
[0.0.2]: https://github.com/xdemocle/cybergrandpa-web-extension-antifraud/releases/tag/v0.0.2
[0.0.1]: https://github.com/xdemocle/cybergrandpa-web-extension-antifraud/releases/tag/v0.0.1
