# Toolshop Testing Framework

[![Playwright Tests](https://github.com/TheBigBadWolf228/toolshop-testing-framework/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/TheBigBadWolf228/toolshop-testing-framework/actions/workflows/playwright.yml)

API and UI tests for the Practice Software Testing app, written with
Playwright and TypeScript. By default tests run against https://practicesoftwaretesting.com
and its API https://api.practicesoftwaretesting.com. On CI they run against
a copy of the app in Docker.

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
npm run test:all
npm run test:api
npm run test:ui
npm run test:smoke
npm run typecheck
npm run format:check
```

UI tests run in Chrome, Firefox and Safari. `test:smoke` runs only the main happy
paths (tagged @smoke) in Chrome and positive API tests.

When a test fails because an API call or the browser failed, the report has
`api-calls.md` (failed API calls with a curl to reproduce manually)
For UI tests, `browser-log.md` has page URL, failed browser API calls and console errors.
UI tests also get a screenshot. The curl uses $TOKEN, so paste valid one first.

## Running against the app in Docker

CI starts its copy of the app in Docker for every test job. The demo site
is behind Cloudflare, which blocks browsers from GitHub runners. A fresh app per
job also means no hourly resets and no data from other people.

The same works locally:

```bash
docker compose -f docker/app.compose.yml up -d
docker compose -f docker/app.compose.yml exec -T laravel-api php artisan migrate:fresh --seed --force
UI_URL=http://localhost:4200 API_URL=http://localhost:8091 npm run test:all
docker compose -f docker/app.compose.yml down -v
```

If the seed fails right after `up`, the database is still starting, run it again.
Set `UI_URL` and `API_URL` in the shell, not in .env.

## CI

On CI, pull requests run UI tests in Chrome, merges to main in Chrome, Firefox and Safari.
Main only changes through pull requests, and the `ci-ok` check has to pass before merge.
Dependabot opens update PRs for npm packages and GitHub Actions every week.

Every night at 02:20 UTC the same run starts on main and publishes the Allure report.
Every Sunday a flake hunt runs every test 3 times, without the tests tagged @flaky, and
fails if a test only passed on retry. When a nightly or flake hunt fails it opens a
GitHub issue (labels `main-failure` and `flaky-tests`). Later failures comment on it, and
the next green run closes it. Both can also be started by hand from the Actions tab.

## API tests

Each resource has a client in `tests/api/clients` that sends the requests and
checks the response with a Zod schema from `tests/api/schemas`. Test data comes
from Faker factories in `tests/api/factories`.

Tests get clients for admin, customer and no token from fixtures in
`tests/api/support/fixtures.ts`. Data a test creates is deleted after the test,
newest first.

## UI tests

UI tests use page objects. Each page in `tests/ui/pages` has its locators and
actions. Parts used on several pages (header, product grid, filters, address
form) are components in `tests/ui/components`.

Tests get page objects, API clients and the logged-in role from fixtures in
`tests/ui/support/fixtures.ts`. Some test data is created through the API before
the test and deleted after it. Invoices and contact messages **can't be deleted
in the app**, so checkout and contact leave some data behind.

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

**The Allure report of the latest run on main is published here**:
https://thebigbadwolf228.github.io/toolshop-testing-framework/

The terminal also prints a short summary at the end of a run when there is
something to know: how many known bugs still fail as expected, a known bug that
started passing (close its issue and remove test.fail), and tests that passed
only on retry.

## Coverage

API: brands, categories and products have CRUD tests with response schema checks
and 404/405 tests. Brands and products also have 422 validation tests.
Products have access control tests for admin, customer, no token and an invalid
token. Brands check that only admin can delete. Auth tests cover the customer
and admin login and a request without a token.

UI: product list (search, price filter, sort, category filter, pagination),
product details and related products, cart, checkout until the invoice shows in
the account, registration and login, logout, favorites, profile update,
invoices list, contact form, and creating a product as admin.

## Known API bugs

These tests are marked with `test.fail`. They pass while the bug exists and
fail once it is fixed.

- POST, PUT and PATCH /products work without a token
- Unknown brand_id, category_id or product_image_id returns 500 instead of 422
- price: 1e12 returns 500 instead of 422
- PUT /products/{id} with an empty body returns 200 and changes nothing

## Known UI bugs

These bugs only happen sometimes, so the tests get retries instead of `test.fail`.

- The admin dashboard sometimes shows no content (`null.toFixed` error)
- The profile form sometimes stays empty in Chrome when tests run in parallel
