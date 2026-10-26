# Toolshop Testing Framework

API tests for the Practice Software Testing (Toolshop) app, written with
Playwright and TypeScript. Tests run against https://api.practicesoftwaretesting.com

UI tests will be described here once more of them are added with the Page Object pattern.

## Stack

Playwright, TypeScript, Zod, Faker, Allure, Prettier.

## Setup

```bash
npm ci
cp .env.example .env
```

The .env file holds the admin and customer logins. The defaults are the demo accounts of the app.

## Running tests

```bash
npm run test:api
npm run typecheck
npm run format:check
```

When a test fails because an API call or the browser failed, the report has
`api-calls.md` (failed API calls with a curl to reproduce manually)
For UI tests, `browser-log.md` has page URL, failed browser API calls and console errors.
UI tests also get a screenshot. The curl uses $TOKEN, so paste valid one first.

## Reports

Every run writes two reports.

The Playwright HTML report is for debugging. It has every click and API call, the trace, screenshots 
and the logs above.

```bash
npx playwright show-report
```

The Allure report is the readable one. It shows only the test steps, like
"Create product" or "Add to cart", but not every click. 
It groups failures by cause like:
login failed, cleanup failed, API server error, timeout.
It links known bugs to their GitHub issue and keeps history between runs, so new
and flaky tests stand out.

```bash
npm run report:allure
```

The terminal also prints a short summary at the end of a run when there is
something to know: how many known bugs still fail as expected, a known bug that
started passing (close its issue and remove test.fail), and tests that passed
only on retry.

## Coverage

Brands, categories and products have CRUD tests with response schema checks
and 404/405 tests. Brands and products also have 422 validation tests.
Products have access control tests for admin, customer, no token and an invalid
token. Brands check that only admin can delete. Auth tests cover the customer
and admin login and a request without a token.

## Known API bugs

These tests are marked with test.fail. They pass while the bug exists and
fail once it is fixed.

- POST, PUT and PATCH /products work without a token
- Unknown brand_id, category_id or product_image_id returns 500 instead of 422
- price: 1e12 returns 500 instead of 422
- PUT /products/{id} with an empty body returns 200 and changes nothing
