# Assignments YAML Specification

This document describes the structure and validation rules for assignment YAML files used in the python-grader-client.

## File Structure

Each YAML file in the `assignments/` directory represents a single lecture with one or more assignments.

### Top-Level Fields

```yaml
lectureNumber: 8
slug: 08-recursion
title: アルゴリズム：再帰

assignments:
  - # ... (see Assignment Object below)
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lectureNumber` | number | Yes | The lecture number (e.g., 1, 2, 3) |
| `slug` | string | Yes | URL-friendly identifier (e.g., "01-intro", "08-recursion") |
| `title` | string | Yes | Human-readable lecture title |
| `assignments` | array | Yes | List of assignment objects (minimum 1) |

### Assignment Object

```yaml
- id: fibonacci-recursive
  title: フィボナッチ（末尾再帰）
  packages: ["numpy", "pandas"]  # optional
  tests:
    - # ... (see Test Object below)
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the assignment within the lecture |
| `title` | string | Yes | Display title for the assignment |
| `packages` | array of strings | No | Python packages to install before running tests |
| `tests` | array | Yes | List of test cases (minimum 1) |

### Test Object

```yaml
- preCode: "import math"
  postCode: "print(fibonacci(10))"
  expected: "55"
```

Or using the `preCodes` array (will be converted to `preCode`):

```yaml
- preCodes:
    - "import math"
    - "x = 10"
  postCode: "print(x * 2)"
  expected: "20"
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `preCode` | string | No | Code to execute before the user's code (default: `""`) |
| `preCodes` | array of strings | No | Alternative to `preCode` - multiple lines that will be joined with `\n` |
| `postCode` | string | No | Code to execute after the user's code (default: `""`) |
| `expected` | string | **Yes** | Expected output from the test execution |

**Important Notes:**
- Either `preCode` or `preCodes` can be used, but not both
- If `preCodes` is provided, it will be converted to `preCode` by joining with newlines
- `expected` field is **required** - validation will fail if omitted
- Empty strings are valid for `preCode` and `postCode`

## Validation

The build script (`scripts/build-assignments.js`) validates all YAML files using Zod schemas:

### Common Validation Errors

1. **Missing required fields:**
   ```
   ❌ Schema validation error in 08-recursion.yaml:
     - assignments.0.tests.3.expected: Invalid input: expected string, received undefined
   ```
   **Solution:** Add the missing `expected` field to the test case

2. **Empty assignments array:**
   ```
   ❌ Schema validation error in 01-intro.yaml:
     - assignments: Array must contain at least 1 element(s)
   ```
   **Solution:** Add at least one assignment

3. **Empty tests array:**
   ```
   ❌ Schema validation error in 02-loops.yaml:
     - assignments.0.tests: Array must contain at least 1 element(s)
   ```
   **Solution:** Add at least one test case

## Example

Complete example with multiple assignments and test cases:

```yaml
lectureNumber: 8
slug: 08-recursion
title: アルゴリズム：再帰

assignments:
  - id: fibonacci-recursive
    title: フィボナッチ（末尾再帰）
    tests:
      - postCode: "print(fibonacci(1))"
        expected: "1"
      - postCode: "print(fibonacci(2))"
        expected: "1"
      - postCode: "print(fibonacci(10))"
        expected: "55"

  - id: reverse-recursive
    title: 再帰関数でリスト反転
    tests:
      - preCode: ""
        postCode: "print(reverse([1, 2, 3, 4, 5]))"
        expected: "[5, 4, 3, 2, 1]"
      - preCode: ""
        postCode: "print(reverse([]))"
        expected: "[]"

  - id: matrix-operations
    title: 行列演算
    packages: ["numpy"]
    tests:
      - preCodes:
          - "import numpy as np"
          - "arr = np.array([[1, 2], [3, 4]])"
        postCode: "print(matrix_sum(arr))"
        expected: "10"
```

## Build Process

Run the build script to validate and compile assignments:

```bash
npm run build-assignments
```

This will:
1. Read all `.yaml` and `.yml` files from `assignments/` directory
2. Validate each file against the schema
3. Convert `preCodes` arrays to `preCode` strings
4. Remove internal fields (like `_anchors`)
5. Output to `public/assignments.json`

If validation fails, the script will exit with an error message indicating the file and field that caused the problem.
