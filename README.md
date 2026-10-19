# Toolshop Testing Framework

API tests for the Practice Software Testing (Toolshop) app, written with
Playwright and TypeScript. Tests run against https://api.practicesoftwaretesting.com

UI tests will be described here once more of them are added with the Page Object pattern.

## Stack

Playwright, TypeScript, Zod, Faker, Prettier.

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
npx playwright show-report
```

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
