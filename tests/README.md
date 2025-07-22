# Tests Directory

This directory contains all test files and test-related resources for the Resume Tailor application.

## Structure

### `/manual/`

Contains manual test scripts that can be run to validate different aspects of the application:

- **API Tests**: Files testing the resume generation endpoints
- **Integration Tests**: End-to-end workflow validation
- **Schema Tests**: Validation of the conditional field system
- **Edge Case Tests**: Testing problematic inputs and edge scenarios
- **Sample Data**: Test resume files and sample inputs

## Running Tests

Most test files can be run directly with Node.js:

```bash
# Example: Run a specific test
node tests/manual/test-complete-workflow.js

# Or run from the project root
node tests/manual/test-all-conditional-fields.js
```

## Test Categories

- **Conditional Logic Tests**: Validate the has\_{fieldname} system
- **Contact System Tests**: Test contact information preservation
- **DOCX Generation Tests**: Validate document generation
- **Schema Validation Tests**: Test API schema compliance
- **Workflow Tests**: End-to-end user journey validation

## Notes

- These are manual tests that output results to the console
- Make sure the development server is running before executing API-dependent tests
- Sample data files are included for consistent testing
