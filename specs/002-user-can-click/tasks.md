# Tasks: Image Detail View Feature

**Input**: Design documents from `/specs/002-user-can-click/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Feature Overview
Implement an image detail view modal that allows users to click on any photo in the gallery to view it in a focused 2-column layout with the image on the left and metadata (uploader info, date/time) on the right.

## Phase 3.1: Setup
- [X] T001 Verify project structure has src/components/, src/pages/, src/hooks/, src/services/, src/types/, src/utils/
- [X] T002 Install/verify shadcn/ui components for modal and buttons
- [X] T003 [P] Configure TypeScript types for Image and User entities

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [X] T004 [P] Contract test GET /api/images/{id} in tests/contract/test_image_get.test.ts
- [X] T005 [P] Contract test GET /api/images/{id}/file in tests/contract/test_image_file_get.test.ts
- [X] T006 [P] Contract test PUT /api/images/{id} in tests/contract/test_image_put.test.ts
- [X] T007 [P] Integration test image click opens detail modal in tests/integration/test_image_detail_flow.test.tsx
- [X] T008 [P] Integration test modal close methods in tests/integration/test_modal_close.test.tsx
- [X] T009 [P] Accessibility test for modal in tests/accessibility/test_modal_accessibility.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [X] T010 [P] Image type definition in src/types/image.ts
- [X] T011 [P] User type definition in src/types/user.ts
- [X] T012 [P] ImageDetailState interface in src/types/state.ts
- [X] T013 [P] useImageDetail hook in src/hooks/useImageDetail.ts
- [X] T014 [P] ImageMetadata component in src/components/ImageMetadata/ImageMetadata.tsx
- [X] T015 [P] ImageDetailModal component in src/components/ImageDetailModal/ImageDetailModal.tsx
- [X] T016 Update ImageGallery component to handle click events
- [X] T017 GET /api/images/{id} endpoint implementation
- [X] T018 GET /api/images/{id}/file endpoint implementation
- [X] T019 PUT /api/images/{id} endpoint implementation
- [X] T020 Image service with detail fetching methods

## Phase 3.4: Integration
- [X] T021 Connect modal to gallery state management
- [X] T022 Implement image file URL generation
- [X] T023 Add keyboard navigation (ESC to close)
- [X] T024 Add click-outside-to-close functionality
- [X] T025 Implement focus trapping for accessibility
- [X] T026 Add screen reader announcements

## Phase 3.5: Polish
- [X] T027 [P] Unit tests for useImageDetail hook in tests/hooks/test_useImageDetail.test.ts
- [X] T028 [P] Unit tests for ImageMetadata component in tests/components/test_ImageMetadata.test.tsx
- [X] T029 Performance tests (<100ms modal transitions)
- [X] T030 [P] Add responsive design for mobile stacking
- [X] T031 Add loading states for image fetching
- [X] T032 Add error handling for failed image loads
- [X] T033 Run quickstart.md test scenarios

## Dependencies
- Tests (T004-T009) before implementation (T010-T020)
- Type definitions (T010-T012) block components (T014-T015)
- ImageDetailModal (T015) depends on useImageDetail (T013) and ImageMetadata (T014)
- Gallery update (T016) depends on modal (T015)
- Implementation before integration (T021-T026)
- Integration before polish (T027-T033)

## Parallel Example
```
# Launch T004-T009 together:
Task: "Contract test GET /api/images/{id} in tests/contract/test_image_get.test.ts"
Task: "Contract test GET /api/images/{id}/file in tests/contract/test_image_file_get.test.ts"
Task: "Contract test PUT /api/images/{id} in tests/contract/test_image_put.test.ts"
Task: "Integration test image click opens detail modal in tests/integration/test_image_detail_flow.test.tsx"
Task: "Integration test modal close methods in tests/integration/test_modal_close.test.tsx"
Task: "Accessibility test for modal in tests/accessibility/test_modal_accessibility.test.tsx"

# Launch T010-T012 together:
Task: "Image type definition in src/types/image.ts"
Task: "User type definition in src/types/user.ts"
Task: "ImageDetailState interface in src/types/state.ts"

# Launch T027, T028, T030 together:
Task: "Unit tests for useImageDetail hook in tests/hooks/test_useImageDetail.test.ts"
Task: "Unit tests for ImageMetadata component in tests/components/test_ImageMetadata.test.tsx"
Task: "Add responsive design for mobile stacking"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Follow constitutional principles: 100% test coverage, accessibility first, React functional components
- Use shadcn/ui components where possible
- Implement WCAG 2.1 AA compliance
- Ensure offline-first functionality with SQLite