# CRUD Accessibility Checklist - Black-Cross Platform

**Analysis ID**: UX47D2
**Date**: 2025-10-24
**Target**: WCAG 2.1 Level AA Compliance for CRUD Operations

---

## Executive Summary

This checklist ensures all CRUD operations meet **WCAG 2.1 Level AA** accessibility standards. Use this checklist when implementing or auditing Create, Read, Update, and Delete functionality.

**Current Status**: ❌ Non-compliant (estimated 30% compliance)
**Target Status**: ✅ WCAG 2.1 AA Compliant (90%+ compliance)

---

## 1. Keyboard Navigation (WCAG 2.1.1, 2.1.2, 2.1.3)

### Form Navigation

- [ ] **Tab Order**: All interactive elements are reachable via Tab key in logical order
- [ ] **Shift+Tab**: Reverse tab navigation works correctly
- [ ] **No Keyboard Traps**: User can navigate away from all elements
- [ ] **Skip Links**: Provide "Skip to main content" link for keyboard users
- [ ] **Focus Visible**: Clear visual focus indicator on all interactive elements (2px outline minimum)
- [ ] **Focus Management**: Focus moves logically through form fields

### Form Field Requirements

- [ ] **Text Fields**: All text inputs are keyboard accessible
- [ ] **Dropdowns**: Select menus can be opened and navigated with arrow keys
- [ ] **Checkboxes**: Can be toggled with Space key
- [ ] **Radio Buttons**: Can be selected with arrow keys
- [ ] **Date Pickers**: Keyboard accessible with arrow keys for date selection
- [ ] **Autocomplete**: Can be navigated with arrow keys, selected with Enter

### Button Interactions

- [ ] **Primary Actions**: Submit buttons activate with Enter key
- [ ] **Secondary Actions**: Cancel buttons activate with Enter when focused
- [ ] **Icon Buttons**: All icon-only buttons are keyboard accessible with Enter/Space

### Dialog Interactions

- [ ] **Open Dialog**: Triggered by keyboard (Enter/Space on button)
- [ ] **Focus Trap**: Focus stays within dialog when open
- [ ] **Escape to Close**: Esc key closes dialog
- [ ] **Return Focus**: Focus returns to trigger element after dialog closes
- [ ] **Tab Order**: Tab cycles through dialog elements only

### Keyboard Shortcuts (Nice-to-Have)

- [ ] **Ctrl/Cmd+S**: Save form (in Create/Edit pages)
- [ ] **Esc**: Cancel operation or close dialog
- [ ] **Alt+N**: Create new item (from list view)
- [ ] **Alt+E**: Edit current item (from detail view)
- [ ] **Ctrl/Cmd+Enter**: Submit form
- [ ] **Documented**: All keyboard shortcuts documented in help/settings

---

## 2. Screen Reader Support (WCAG 1.1.1, 1.3.1, 2.4.6, 4.1.2)

### Page Structure

- [ ] **Page Title**: Each page has unique, descriptive `<title>` tag
- [ ] **Headings**: Logical heading hierarchy (h1 → h2 → h3)
- [ ] **Landmarks**: Proper use of semantic HTML5 landmarks (header, nav, main, footer)
- [ ] **Document Language**: `lang` attribute on `<html>` tag

### Form Labels

- [ ] **All Fields Labeled**: Every form field has associated `<label>` or `aria-label`
- [ ] **Label Association**: Labels properly linked to inputs via `for`/`id` or nesting
- [ ] **Placeholders Not Labels**: Placeholder text does not replace labels
- [ ] **Required Indicators**: Required fields have `aria-required="true"` or `required` attribute
- [ ] **Optional Indicators**: Optional fields clearly marked (e.g., "(optional)" in label)

### Form Validation

- [ ] **Error Announcement**: Validation errors announced to screen readers
  ```tsx
  <TextField
    error={!!errors.name}
    helperText={errors.name?.message}
    inputProps={{
      'aria-invalid': !!errors.name,
      'aria-describedby': 'name-error'
    }}
  />
  ```
- [ ] **Error Messages**: Error messages linked to fields via `aria-describedby`
- [ ] **Form-Level Errors**: Summary of errors announced with `role="alert"`
- [ ] **Success Feedback**: Success messages announced with `aria-live="polite"`

### Interactive Elements

- [ ] **Button Labels**: All buttons have descriptive labels or `aria-label`
  ```tsx
  <IconButton aria-label="Edit threat intelligence item">
    <EditIcon />
  </IconButton>
  ```
- [ ] **Link Purpose**: Link text describes destination (avoid "click here")
- [ ] **Button vs Link**: Use `<button>` for actions, `<a>` for navigation
- [ ] **Icon-Only Actions**: Icon buttons have `aria-label` with context
  ```tsx
  <IconButton aria-label={`Delete ${item.name}`}>
    <DeleteIcon />
  </IconButton>
  ```

### Dynamic Content

- [ ] **Loading States**: Announced with `aria-live="polite"` or `role="status"`
  ```tsx
  <div role="status" aria-live="polite">
    {loading ? 'Loading threat intelligence data...' : null}
  </div>
  ```
- [ ] **Success Notifications**: Announced with `aria-live="polite"`, `role="alert"`
- [ ] **Error Notifications**: Announced with `aria-live="assertive"`, `role="alert"`
- [ ] **Content Updates**: Dynamic content changes announced appropriately

### Dialogs and Modals

- [ ] **Dialog Role**: Confirmation dialogs have `role="alertdialog"`
- [ ] **Dialog Title**: Dialog has `aria-labelledby` pointing to title
- [ ] **Dialog Description**: Dialog has `aria-describedby` pointing to message
- [ ] **Focus Management**: Focus moves to dialog when opened
- [ ] **Dismissal**: Screen reader users can dismiss dialog

### Tables

- [ ] **Table Headers**: Column headers properly marked with `<th scope="col">`
- [ ] **Row Headers**: Row headers marked with `<th scope="row">` if applicable
- [ ] **Table Caption**: Table has `<caption>` or `aria-label` describing purpose
- [ ] **Sortable Columns**: Sort controls announced with `aria-sort` attribute

### Status and State

- [ ] **Loading Indicators**: `aria-busy="true"` on loading containers
- [ ] **Disabled States**: Disabled fields have `disabled` attribute
- [ ] **Selected States**: Selected items have `aria-selected="true"`
- [ ] **Expanded States**: Collapsible sections have `aria-expanded`

---

## 3. Visual Design (WCAG 1.4.1, 1.4.3, 1.4.11)

### Color Contrast

- [ ] **Text Contrast**: Normal text has 4.5:1 contrast ratio minimum
- [ ] **Large Text Contrast**: Large text (18pt+) has 3:1 contrast ratio minimum
- [ ] **UI Component Contrast**: Interactive elements have 3:1 contrast ratio
- [ ] **Focus Indicators**: Focus outlines have 3:1 contrast against background
- [ ] **Error States**: Error text/icons have sufficient contrast

### Color Usage

- [ ] **Not Color Alone**: Information not conveyed by color alone
  - ✅ Good: Severity shown with color + icon + text
  - ❌ Bad: Status shown only with color
- [ ] **Error Indication**: Errors marked with icon/text, not just red color
- [ ] **Required Fields**: Marked with asterisk/text, not just color
- [ ] **Status Indicators**: Use icons + text + color for status (e.g., Chip with label)

### Focus Indicators

- [ ] **Always Visible**: Focus indicators never hidden or removed
- [ ] **Sufficient Size**: Minimum 2px outline or border
- [ ] **Sufficient Contrast**: 3:1 contrast against background
- [ ] **Custom Focus Styles**: If customizing, ensure they meet standards
  ```css
  &:focus-visible {
    outline: 2px solid #1976d2;
    outline-offset: 2px;
  }
  ```

### Text Sizing and Spacing

- [ ] **Minimum Size**: Body text at least 16px (1rem)
- [ ] **Line Height**: Body text line-height at least 1.5
- [ ] **Paragraph Spacing**: Paragraph spacing at least 2x font-size
- [ ] **Letter Spacing**: Letter spacing at least 0.12x font-size
- [ ] **Resizable Text**: Text can be resized to 200% without loss of functionality

---

## 4. Form Design (WCAG 1.3.1, 1.3.5, 3.3.1, 3.3.2, 3.3.3, 3.3.4)

### Field Labeling

- [ ] **Visible Labels**: All fields have visible, persistent labels
- [ ] **Label Position**: Labels positioned above or to the left of fields
- [ ] **Label Association**: Labels programmatically linked to inputs
- [ ] **Required Indication**: Required fields clearly marked with "*" and text
  ```tsx
  <TextField
    label="Name *"
    required
    aria-required="true"
  />
  ```

### Field Instructions

- [ ] **Format Guidance**: Complex fields have format instructions
  - Example: "Date format: YYYY-MM-DD"
- [ ] **Character Limits**: Fields with limits show count (e.g., "45/100 characters")
- [ ] **Helper Text**: Non-obvious fields have helper text explaining purpose
- [ ] **Error Prevention**: Input masks or validation prevent common errors

### Error Handling

- [ ] **Error Identification**: Errors clearly identify which field has problem
- [ ] **Error Description**: Errors describe the problem (not just "invalid")
- [ ] **Error Suggestions**: Errors provide suggestion for correction
  - Example: "Password must contain at least one number"
- [ ] **Error Focus**: First error field receives focus after submit
- [ ] **Error Summary**: Form-level error summary at top of form (optional, helpful)

### Success Confirmation

- [ ] **Success Message**: Clear confirmation after successful submission
- [ ] **Next Steps**: User knows what happens next or where to go
- [ ] **Undo Option**: Option to undo destructive actions (nice-to-have)

### Auto-Complete

- [ ] **AutoComplete Attribute**: Fields have appropriate `autocomplete` attributes
  ```tsx
  <TextField
    name="email"
    autoComplete="email"
  />
  <TextField
    name="password"
    type="password"
    autoComplete="current-password"
  />
  ```
- [ ] **Common Fields**: Name, email, address, phone use standard autocomplete values

---

## 5. Content and Language (WCAG 1.3.1, 2.4.2, 2.4.4, 3.1.1, 3.2.1, 3.2.2)

### Page Titles

- [ ] **Unique Titles**: Each page has unique `<title>` tag
- [ ] **Descriptive**: Title describes page purpose
- [ ] **Format**: `[Page Name] - [Module] - Black-Cross`
  - Example: "Create New Threat - Threat Intelligence - Black-Cross"

### Headings

- [ ] **Page Heading**: Each page starts with h1
- [ ] **Logical Hierarchy**: Headings follow h1 → h2 → h3 order
- [ ] **Descriptive**: Headings clearly describe content sections

### Link Text

- [ ] **Descriptive Links**: Link text describes destination
  - ✅ Good: "View threat details"
  - ❌ Bad: "Click here"
- [ ] **Unique Text**: Links to different pages have different text
- [ ] **Link Purpose**: Purpose clear from link text alone

### Button Text

- [ ] **Action-Oriented**: Buttons use action verbs
  - ✅ Good: "Create Threat", "Save Changes", "Delete Item"
  - ❌ Bad: "Submit", "OK", "Yes"
- [ ] **Context-Specific**: Buttons reference specific entity
  - ✅ Good: "Delete Vulnerability"
  - ❌ Bad: "Delete"

### Predictable Behavior

- [ ] **Focus Order**: Focus order follows visual order
- [ ] **On Focus**: Focusing element doesn't trigger unexpected changes
- [ ] **On Input**: Changing input doesn't trigger unexpected context changes
- [ ] **Consistent Navigation**: Navigation elements in same location across pages
- [ ] **Consistent Identification**: Same functionality has same labels across site

---

## 6. Mobile and Touch (WCAG 2.5.1, 2.5.5)

### Touch Targets

- [ ] **Minimum Size**: All interactive elements at least 44px x 44px
- [ ] **Spacing**: At least 8px spacing between adjacent touch targets
- [ ] **Icon Buttons**: Icon buttons meet minimum size requirement
  ```tsx
  <IconButton sx={{ width: 44, height: 44 }}>
    <EditIcon />
  </IconButton>
  ```

### Gestures

- [ ] **Single Pointer**: All functionality available via single pointer (tap)
- [ ] **No Path-Based**: No gestures requiring specific path (e.g., swipe patterns)
- [ ] **Alternative Input**: Multi-touch gestures have single-touch alternative

### Orientation

- [ ] **Both Orientations**: App works in both portrait and landscape
- [ ] **No Restriction**: Orientation not restricted unless essential

---

## 7. CRUD-Specific Accessibility

### Create Operation

- [ ] **Page Title**: `<title>Create New [Entity] - Black-Cross</title>`
- [ ] **Heading**: Page starts with `<h1>Create New [Entity]</h1>`
- [ ] **Form Role**: Form has `role="form"` or native `<form>` element
- [ ] **Required Fields**: All required fields marked visually and with `aria-required`
- [ ] **Submit Button**: Clear submit button with descriptive label
- [ ] **Cancel Action**: Cancel action available and clearly labeled
- [ ] **Unsaved Warning**: Warning before leaving with unsaved changes
- [ ] **Success Feedback**: Success announced after creation

### Edit Operation

- [ ] **Page Title**: `<title>Edit [Entity Name] - Black-Cross</title>`
- [ ] **Heading**: Page starts with `<h1>Edit: [Entity Name]</h1>`
- [ ] **Pre-Populated**: Form pre-populated with existing data
- [ ] **Loading State**: Loading state announced while fetching data
- [ ] **Changed Indication**: Changed fields indicated (nice-to-have)
- [ ] **Unsaved Warning**: Warning before leaving with unsaved changes
- [ ] **Success Feedback**: Success announced after update

### Delete Operation

- [ ] **Confirmation Required**: Confirmation dialog before delete
- [ ] **Dialog Role**: Confirmation has `role="alertdialog"`
- [ ] **Dialog Title**: Title describes action "Delete [Entity]?"
- [ ] **Dialog Message**: Clear message with entity name and warning
- [ ] **Focus on Cancel**: Focus defaults to Cancel button (safer)
- [ ] **Destructive Styling**: Delete button uses error/warning color
- [ ] **Success Feedback**: Success announced after deletion
- [ ] **Keyboard Dismissal**: Dialog can be dismissed with Esc key

### Detail (Read) Operation

- [ ] **Page Title**: `<title>[Entity Name] - [Module] - Black-Cross</title>`
- [ ] **Heading**: Page starts with `<h1>[Entity Name]</h1>`
- [ ] **Field Labels**: Read-only fields have visible labels
- [ ] **Empty States**: Empty/null values clearly indicated
- [ ] **Action Buttons**: Edit/Delete buttons properly labeled
- [ ] **Navigation**: Back button clearly labeled and keyboard accessible

### List Operation

- [ ] **Page Title**: `<title>[Module] - Black-Cross</title>`
- [ ] **Heading**: Page starts with `<h1>[Entity Plural]</h1>`
- [ ] **Table Headers**: Table has proper `<th>` elements
- [ ] **Row Navigation**: Rows navigable with keyboard (Enter to view details)
- [ ] **Action Buttons**: Row actions have descriptive labels
- [ ] **Empty State**: Empty list has helpful message
- [ ] **Filter Labels**: All filter controls properly labeled
- [ ] **Sort Controls**: Sortable columns announced with `aria-sort`
- [ ] **Pagination**: Pagination controls keyboard accessible

---

## 8. Testing Checklist

### Automated Testing

- [ ] **Lighthouse Accessibility**: Score 90+ in Chrome DevTools Lighthouse
- [ ] **axe DevTools**: No critical or serious violations
- [ ] **WAVE Browser Extension**: No errors, minimal alerts
- [ ] **Pa11y CI**: Integrated in CI/CD pipeline

### Manual Testing

#### Keyboard Testing
- [ ] **Unplug Mouse**: Complete entire CRUD flow using only keyboard
- [ ] **Tab Through**: Tab through entire page, verify all interactive elements reachable
- [ ] **Focus Visible**: Verify focus indicator visible on all elements
- [ ] **No Traps**: Verify no keyboard traps

#### Screen Reader Testing
- [ ] **NVDA (Windows)**: Test with NVDA screen reader
- [ ] **JAWS (Windows)**: Test with JAWS screen reader (if available)
- [ ] **VoiceOver (Mac)**: Test with VoiceOver
- [ ] **TalkBack (Android)**: Test mobile views with TalkBack
- [ ] **Forms**: Verify all form fields announced correctly
- [ ] **Errors**: Verify validation errors announced
- [ ] **Success**: Verify success messages announced
- [ ] **Tables**: Verify table structure announced correctly

#### Visual Testing
- [ ] **Zoom to 200%**: Verify all functionality works at 200% zoom
- [ ] **High Contrast Mode**: Test in Windows High Contrast mode
- [ ] **Dark Mode**: Test in dark mode (if supported)
- [ ] **Color Blindness**: Test with color blindness simulators
- [ ] **Mobile Devices**: Test on actual mobile devices

#### Touch Testing
- [ ] **Touch Targets**: Verify all buttons easy to tap
- [ ] **Spacing**: Verify no accidental taps due to close buttons
- [ ] **Gestures**: Verify single-tap works for all actions

---

## 9. Compliance Verification

### WCAG 2.1 Level AA Criteria Coverage

#### Perceivable
- [1.1.1] Non-text Content - Alt text for all images/icons
- [1.3.1] Info and Relationships - Semantic HTML, ARIA labels
- [1.3.4] Orientation - Works in both orientations
- [1.3.5] Identify Input Purpose - Autocomplete attributes
- [1.4.1] Use of Color - Not color alone for information
- [1.4.3] Contrast (Minimum) - 4.5:1 for text, 3:1 for UI
- [1.4.10] Reflow - Content reflows at 320px width
- [1.4.11] Non-text Contrast - 3:1 for UI components
- [1.4.12] Text Spacing - Works with increased spacing
- [1.4.13] Content on Hover or Focus - Dismissible, hoverable, persistent

#### Operable
- [2.1.1] Keyboard - All functionality via keyboard
- [2.1.2] No Keyboard Trap - Can navigate away from all elements
- [2.1.4] Character Key Shortcuts - Shortcuts can be remapped/disabled
- [2.4.1] Bypass Blocks - Skip links provided
- [2.4.2] Page Titled - Unique, descriptive titles
- [2.4.3] Focus Order - Logical, sequential focus order
- [2.4.4] Link Purpose (In Context) - Link purpose clear
- [2.4.6] Headings and Labels - Descriptive headings/labels
- [2.4.7] Focus Visible - Focus indicator visible
- [2.5.1] Pointer Gestures - Single pointer alternative
- [2.5.2] Pointer Cancellation - Can cancel pointer actions
- [2.5.3] Label in Name - Accessible name includes visible label
- [2.5.4] Motion Actuation - No motion-based input

#### Understandable
- [3.1.1] Language of Page - Lang attribute on HTML
- [3.2.1] On Focus - No context change on focus
- [3.2.2] On Input - No unexpected context change on input
- [3.2.3] Consistent Navigation - Navigation consistent
- [3.2.4] Consistent Identification - Components consistent
- [3.3.1] Error Identification - Errors identified
- [3.3.2] Labels or Instructions - Labels/instructions provided
- [3.3.3] Error Suggestion - Suggestions for errors
- [3.3.4] Error Prevention (Legal, Financial, Data) - Confirmation for important actions

#### Robust
- [4.1.1] Parsing - Valid HTML
- [4.1.2] Name, Role, Value - ARIA attributes correct
- [4.1.3] Status Messages - Status announced

---

## 10. Priority Matrix

### Critical (Must Fix Before Release)
- [ ] Keyboard navigation functional
- [ ] All interactive elements have accessible names
- [ ] Form validation errors announced
- [ ] Color contrast meets 4.5:1 for text
- [ ] Confirmation dialogs before delete
- [ ] Page titles unique and descriptive

### High (Fix in Next Sprint)
- [ ] Screen reader testing passed
- [ ] Focus indicators visible and clear
- [ ] Loading/success/error states announced
- [ ] Helper text for complex fields
- [ ] Touch targets at least 44px

### Medium (Fix Within 2 Sprints)
- [ ] Autocomplete attributes on forms
- [ ] Keyboard shortcuts for common actions
- [ ] Enhanced empty states
- [ ] Improved error messages with suggestions

### Low (Future Enhancement)
- [ ] Breadcrumb navigation
- [ ] Undo functionality for deletions
- [ ] Advanced keyboard shortcuts
- [ ] Customizable font sizes

---

## Conclusion

**Accessibility is not optional** for enterprise security software. Following this checklist ensures:

1. ✅ **Legal Compliance**: Meet WCAG 2.1 AA standards (required by many regulations)
2. ✅ **Wider Audience**: Software usable by people with disabilities (15-20% of population)
3. ✅ **Better UX for Everyone**: Accessibility improvements benefit all users
4. ✅ **Keyboard Efficiency**: Power users navigate faster with keyboard
5. ✅ **Professional Quality**: Demonstrates commitment to quality and inclusion

**Recommended Approach**:
1. Implement reusable components with accessibility built-in
2. Use this checklist for all new CRUD pages
3. Conduct automated testing in CI/CD
4. Perform manual testing with screen readers
5. Get feedback from users with disabilities
6. Iterate and improve continuously

**Estimated Effort**:
- Initial implementation (with components): 5-7 days
- Testing and refinement: 3-5 days
- Ongoing maintenance: 5-10% of development time

**Target Compliance**: 90%+ WCAG 2.1 Level AA compliance within 2 sprints
