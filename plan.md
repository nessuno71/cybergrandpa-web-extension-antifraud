# CyberGrandpa Anti-Fraud Extension - Project Plan

**Version:** 0.0.3
**Status:** Beta Development
**Last Updated:** 2025-11-23

## Executive Summary

This document outlines the development roadmap for the CyberGrandpa Anti-Fraud web extension. The project has a solid foundation with working URL blocking, comprehensive i18n support (28 languages), and a clean Svelte 5 architecture. However, several critical features need completion before production release.

## Current State Assessment

### ✅ Completed Features

1. **Core URL Blocking System**
   - Compressed blocklist storage (gzip + base64)
   - Automatic sync every 11 hours from hblock.molinero.dev
   - Cross-context proxy service architecture
   - webNavigation-based blocking

2. **User Interface Components**
   - Popup with protection status and manual scanning
   - Options page for settings management
   - Onboarding wizard for first-run experience
   - 11 reusable Svelte 5 components (all using runes syntax)

3. **Internationalization**
   - 28 languages fully supported (exceeds original 7-language spec)
   - YAML-based locale files
   - Browser-specific help screenshots (6 languages)

4. **Cross-Browser Support**
   - Manifest V3 compliant
   - Firefox-specific build pipeline
   - All required permissions properly configured

5. **Storage & State Management**
   - WXT storage API integration
   - 8 persistent storage items
   - Svelte store bindings

### ⚠️ Incomplete/Problematic Features

1. **Close Content Script** (`src/entrypoints/close.content.ts`)
   - **Status:** 90% commented out, non-functional
   - **Issue:** Critical security feature disabled
   - **Action Required:** Complete implementation or remove entirely

2. **Page Scanning Overlay** (`src/components/apps/overlay-loading-app.svelte`)
   - **Status:** Placeholder/fake implementation
   - **Issue:** Shows hardcoded "no issues" after 3-second delay
   - **Action Required:** Implement real scanning or remove feature

3. **Real-time Protection Toggle**
   - **Status:** UI exists but functionality unclear
   - **Issue:** Web blocking runs regardless of toggle state
   - **Action Required:** Clarify purpose or remove as premium placeholder

4. **Tab Blocking Mechanism** (`src/libs/web-blocking.ts`)
   - **Status:** Working but potentially unreliable
   - **Issue:** Uses scripting.executeScript which may have timing issues
   - **Action Required:** Consider declarativeNetRequest API for more reliable blocking

### ❌ Missing Features

1. **Testing Infrastructure**
   - No test files or framework
   - No CI/CD pipeline
   - No automated quality checks

2. **Production Code Quality**
   - Console.log statements in 9 production files
   - No error tracking/reporting
   - No performance monitoring

3. **Documentation**
   - No API documentation
   - No contribution guidelines
   - No changelog
   - CLAUDE.md mentions LokiJS but project uses WXT storage

## Priority Roadmap

### Phase 1: Critical Fixes (Must Complete Before v0.1.0)

**Priority: CRITICAL**
**Timeline:** Immediate

1. **Fix or Remove Close Content Script**
   - [ ] Decide: Complete implementation or remove feature
   - [ ] If keeping: Implement reliable tab closing mechanism
   - [ ] If removing: Remove file and update manifest
   - **Files:** `src/entrypoints/close.content.ts`

2. **Fix or Remove Page Scanning**
   - [ ] Decide: Implement real scanning or remove feature
   - [ ] If keeping: Scan actual page URLs against blocklist
   - [ ] If removing: Remove overlay component and popup integration
   - **Files:** `src/components/apps/overlay-loading-app.svelte`, `src/entrypoints/popup/popup.svelte`

3. **Improve Tab Blocking Reliability**
   - [ ] Research declarativeNetRequest API for URL blocking
   - [ ] Implement fallback mechanism if current approach fails
   - [ ] Add error handling for blocked navigation
   - **Files:** `src/libs/web-blocking.ts`

4. **Remove Debug Code**
   - [ ] Replace console.log with proper logging utility
   - [ ] Add development/production environment check
   - [ ] Implement error reporting service (optional)
   - **Files:** All 9 files with console.log statements

### Phase 2: Testing & Quality (Required for v0.1.0)

**Priority: HIGH**
**Timeline:** Before production release

1. **Testing Infrastructure Setup**
   - [ ] Add Vitest or Jest testing framework
   - [ ] Write unit tests for core services:
     - [ ] `urls-service.ts` - URL matching and storage
     - [ ] `web-blocking.ts` - Blocking logic
     - [ ] `init-db.ts` - Database initialization
   - [ ] Write integration tests for:
     - [ ] Background service worker
     - [ ] Storage synchronization
     - [ ] Cross-context messaging
   - [ ] Add test scripts to package.json
   - [ ] Set minimum coverage threshold (70%)

2. **Component Testing**
   - [ ] Add @testing-library/svelte
   - [ ] Write component tests for:
     - [ ] Popup navigation and state
     - [ ] Options page settings
     - [ ] Wizard flow completion
     - [ ] Toggle components
     - [ ] Modal interactions

3. **End-to-End Testing**
   - [ ] Add Playwright or Puppeteer for E2E tests
   - [ ] Test extension installation flow
   - [ ] Test URL blocking in real browsers
   - [ ] Test cross-browser compatibility (Chrome & Firefox)

### Phase 3: Production Readiness (Required for v1.0.0)

**Priority: MEDIUM**
**Timeline:** After v0.1.0 release

1. **Documentation**
   - [ ] Create comprehensive README with:
     - [ ] Installation instructions
     - [ ] Feature documentation
     - [ ] Troubleshooting guide
   - [ ] Add CONTRIBUTING.md
   - [ ] Add CHANGELOG.md
   - [ ] Update CLAUDE.md to remove LokiJS references
   - [ ] Add JSDoc comments to all public APIs
   - [ ] Create user manual for extension features

2. **Performance Optimization**
   - [ ] Add performance monitoring
   - [ ] Optimize blocklist sync (currently 11 hours)
   - [ ] Measure and optimize memory usage
   - [ ] Add metrics for blocking effectiveness

3. **Error Handling & Monitoring**
   - [ ] Implement centralized error handler
   - [ ] Add Sentry or similar error tracking (optional)
   - [ ] Add user-facing error messages
   - [ ] Implement retry logic for network failures

4. **Code Quality**
   - [ ] Run ESLint and fix all warnings
   - [ ] Run Prettier on entire codebase
   - [ ] Add pre-commit hooks for linting
   - [ ] Set up GitHub Actions for CI/CD

### Phase 4: Feature Enhancements (Post v1.0.0)

**Priority: LOW**
**Timeline:** Future releases

1. **Premium Features Implementation**
   - [ ] Define premium vs. free feature set
   - [ ] Implement real-time protection (if not placeholder)
   - [ ] Add billing/subscription integration
   - [ ] Implement license validation

2. **Advanced Blocking Features**
   - [ ] Custom blocklist management (user-defined)
   - [ ] Whitelist functionality
   - [ ] Temporary allow/block for session
   - [ ] Category-based blocking (ads, malware, trackers, etc.)

3. **Analytics & Reporting**
   - [ ] Track blocked URLs count
   - [ ] Generate weekly safety reports
   - [ ] Show most common threat types
   - [ ] Export blocking history

4. **UI/UX Improvements**
   - [ ] Dark mode support
   - [ ] Customizable themes
   - [ ] Accessibility audit and improvements
   - [ ] Better mobile browser support

5. **Additional Browser Support**
   - [ ] Microsoft Edge testing and optimization
   - [ ] Safari extension (requires different architecture)
   - [ ] Brave browser optimization

## Technical Debt

### High Priority
1. **Architecture Mismatch:** Documentation mentions LokiJS but code uses WXT storage
2. **Commented Code:** close.content.ts has 90% of code commented out
3. **Fake Features:** Page scanning overlay doesn't actually scan
4. **Console Logs:** 9 files have debug console.log statements

### Medium Priority
1. **Error Handling:** Minimal error handling in async operations
2. **Type Safety:** Some any types could be more specific
3. **Code Duplication:** Some repeated patterns could be abstracted

### Low Priority
1. **Bundle Size:** Could optimize with code splitting
2. **Icon Assets:** Multiple sizes could be optimized
3. **CSS Organization:** Some style duplication across components

## Success Metrics

### v0.1.0 Release Criteria
- [ ] All Phase 1 critical fixes completed
- [ ] Test coverage ≥ 70%
- [ ] No console.log in production code
- [ ] All ESLint errors resolved
- [ ] Extension tested in Chrome and Firefox
- [ ] Documentation updated

### v1.0.0 Release Criteria
- [ ] All v0.1.0 criteria met
- [ ] All Phase 3 production readiness items completed
- [ ] Test coverage ≥ 85%
- [ ] Performance benchmarks met
- [ ] Error tracking implemented
- [ ] User manual completed
- [ ] Beta testing with 50+ users

## Risk Assessment

### High Risk
- **Tab Blocking Reliability:** Current implementation may fail in edge cases
- **Page Scanning Feature:** Non-functional feature may confuse users
- **No Testing:** High bug risk without automated tests

### Medium Risk
- **Premium Features Confusion:** UI exists but features not implemented
- **Blocklist Sync Failure:** No retry mechanism for failed syncs
- **Memory Usage:** Compressed blocklist in memory may cause issues on low-end devices

### Low Risk
- **Browser API Changes:** Manifest V3 is stable but may evolve
- **Internationalization:** Over-engineered with 28 languages (low usage for some)
- **Build Tool Updates:** WXT framework is actively maintained

## Next Immediate Steps

1. **Decision Points Required:**
   - Keep or remove close.content.ts feature?
   - Keep or remove page scanning feature?
   - Premium features: placeholder or implement?

2. **Quick Wins (Can be done now):**
   - Remove all console.log statements
   - Run ESLint and fix warnings
   - Update CLAUDE.md to remove LokiJS mention
   - Add CHANGELOG.md

3. **Foundation Work:**
   - Set up Vitest testing framework
   - Write first unit tests for urls-service.ts
   - Implement proper logging utility
   - Add CI/CD with GitHub Actions

## Notes

- Project follows Svelte 5 best practices throughout
- Cross-browser architecture is solid foundation
- Internationalization exceeds requirements (28 vs. 7 languages)
- Core URL blocking functionality works well
- Main blocker to production: testing and incomplete features

---

**Contributors:** Review this plan and provide feedback on priorities and timelines.
**Last Review:** 2025-11-23
**Next Review:** After Phase 1 completion
