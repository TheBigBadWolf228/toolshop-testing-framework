# Toolshop Testing Framework

[![Playwright Tests](https://github.com/TheBigBadWolf228/toolshop-testing-framework/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/TheBigBadWolf228/toolshop-testing-framework/actions/workflows/playwright.yml)

API and UI tests for the [Practice Software Testing](https://practicesoftwaretesting.com) shop,
written with Playwright and TypeScript. CI runs them on every pull request against a fresh
copy of the app in Docker.

Allure report of the latest run on main: https://thebigbadwolf228.github.io/toolshop-testing-framework/

Stack: Playwright, TypeScript, Zod, Faker, Allure, Prettier, Docker, GitHub Actions, k6, Promptfoo.

## Quick start

You only need Docker. This starts the app, waits until it's seeded, runs all tests in
Chrome, Firefox, Safari and API, and removes everything after:

```bash
git clone https://github.com/TheBigBadWolf228/toolshop-testing-framework.git
cd toolshop-testing-framework
cp .env.example .env
mkdir -p reports && docker compose run --rm --build tests; s=$?; docker compose down -v; echo "tests exit: $s"
```

Then open `reports/html/index.html` in a browser for the Playwright report.
`.env` holds the admin and customer logins. The defaults are the demo accounts of the app.
The first run pulls the images and takes a few minutes. The tests take under a minute
(156 passed in 50 s on my machine).

## What's in here

- [tests/api](tests/api): a client per resource, every response checked with a Zod schema. Faker makes the data, fixtures delete it.
- [tests/ui](tests/ui): page objects and components. Test data is created through the API, so the browser only does what the test is about.
- [.github/workflows](.github/workflows): a quick gate, then smoke, then API and UI. Nightly run publishes the Allure report, a weekly flake hunt opens an issue when a test only passes on retry.
- [Dockerfile](Dockerfile), [docker](docker): app and tests in containers, same locally and on CI.
- [infra](infra): on-demand smoke run against the app on an EC2 machine. The job deletes it after the run.
- [Jenkinsfile](Jenkinsfile): the same pipeline on a local Jenkins.
- [assistant](assistant), [evals](evals): a small shop assistant on a local model, tested with Promptfoo. The LLM judge is calibrated against my own labels.
- [perf](perf): k6 load test on `GET /products` with thresholds.

## Running without Docker

Needs Node 26 and the Playwright browsers:

```bash
npm ci
npx playwright install --with-deps
cp .env.example .env
```

```bash
npm run test:all
npm run test:api
npm run test:ui
npm run test:smoke
npm run typecheck
npm run format:check
```

`test:smoke` runs only the main happy paths (tagged @smoke) in Chrome and the positive API tests.

By default these run against the public site https://practicesoftwaretesting.com and its API.
That site is shared with everyone and resets during the day, so a run there can fail
for reasons that have nothing to do with the tests. To run against the local app instead:

```bash
docker compose -f docker/app.compose.yml up -d --wait
UI_URL=http://localhost:4200 API_URL=http://localhost:8091 npm run test:all
docker compose -f docker/app.compose.yml down -v
```

`--wait` returns when the app is seeded and ready (healthchecks in the compose file).
You can also set `UI_URL` and `API_URL` in `.env` (see `.env.example`). The shell wins
if both are set.

To run something else in the test container, put the command after `tests`:
`docker compose run --rm --build tests npx playwright test --project=API`.

## Why Docker

The public site is behind Cloudflare, which blocks browsers from GitHub runners.
A fresh app per job also means no hourly resets and no data from other people.

`docker-compose.yml` adds a `tests` service to the app from `docker/app.compose.yml`.
It builds the `Dockerfile` (Node and browsers from the official Playwright image)
and runs `npx playwright test`. `.env` stays out of the image and is passed at run,
the URLs always point to the local app. Create `reports` before the run, otherwise
Docker creates it as root. CI builds the same image and runs the tests with
`docker compose run`.

## CI

Every run starts with a gate: Prettier, type check, a check that the Docker image matches
the Playwright version, and a check that all tests load. Then smoke, then API and UI.
Pull requests run UI tests in Chrome, merges to main in Chrome, Firefox and Safari.
Main only changes through pull requests, and the `ci-ok` check has to pass before merge.
Dependabot opens update PRs for npm packages and GitHub Actions every week.

Every night at 02:20 UTC the same run starts on main and publishes the Allure report.
Every Sunday a flake hunt runs every test 3 times, without the tests tagged @flaky, and
fails if a test only passed on retry. When a nightly or flake hunt fails it opens a
GitHub issue (labels `main-failure` and `flaky-tests`). Later failures comment on it, and
the next green run closes it. Both can also be started by hand from the Actions tab.

The LLM evals don't run on pull requests or merges. They run by cron and by hand
(LLM Evals > Run workflow, or `gh workflow run evals.yml`). The job installs Ollama,
pulls the models and uploads the Promptfoo report. A failure opens an issue labeled `llm-evals`.

`npm run test:evals` runs them locally. It needs [Ollama](https://ollama.com) with
`qwen2.5:1.5b`, `llama3.2:3b` and `nomic-embed-text` pulled.

The performance test is a small k6 load on `GET /products`: up to 5 users for 35 seconds.
It fails if p95 response time is over 500 ms, more than 1% of requests fail or checks drop
below 99%. Like the evals it runs only by cron and by hand (Performance > Run workflow, or
`gh workflow run perf.yml`). The job starts the app in Docker, runs k6 and uploads the HTML
and JSON report. A failure opens an issue labeled `perf`.

`npm run test:perf` runs the same test locally. It needs
[k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) and the app running in Docker.
It targets http://localhost:8091 unless `API_URL` is set, never the public site.

### AWS run

The smoke tests can also run against the app on an AWS machine.
Start it from the Actions tab (AWS E2E > Run workflow) or with
`gh workflow run aws-e2e.yml --ref <branch>`. The CI user and its permissions
are in `infra/ci-access.yml`.

The job creates a stack from `infra/test-env.yml`: one EC2 machine
(`c7i-flex.large`, `eu-north-1`) that starts the app with compose. The machine
has no open ports. The job opens SSM tunnels to ports 4200 and 8091 and runs
smoke tests.

At the end the job deletes the stack, also when tests fail, so nothing is left
in the account. If that step never runs, the machine terminates itself after
60 minutes.

While the job runs, the app logs are in CloudWatch, log group
`/toolshop/toolshop-e2e-<run id>`.
Failed requests in Logs Insights:

```
fields @timestamp, @logStream, @message
| filter @message like /" 500 /
```

The account is on the AWS free plan until 2027-05-09. After that the workflow
needs a paid account.

### Jenkins (local)

The same pipeline also runs on a local Jenkins in Docker: gate, start the app, smoke, then API
and UI Chrome in parallel ([Jenkinsfile](Jenkinsfile)). Jenkins is set up in `jenkins/`.

Create `jenkins/secrets.properties` with `JENKINS_ADMIN_PASSWORD`, `CUSTOMER_EMAIL`,
`CUSTOMER_PASSWORD`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`,
then run from the repo root:

```bash
mkdir -p jenkins/home
docker compose -f jenkins/compose.yml up -d --build
```

Open http://localhost:8080 and log in as `admin` with the
`JENKINS_ADMIN_PASSWORD` value. The job builds every branch that has a
`Jenkinsfile` and checks GitHub every 5 minutes.

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
the test and deleted after it. Invoices and contact messages can't be deleted
in the app, so checkout and contact leave some data behind.

## Reports

Every run writes two reports.

The Playwright HTML report is for debugging. It has every click and API call, and for
failed tests the trace and a screenshot.

```bash
npx playwright show-report
```

When a test fails because an API call or the browser failed, the report also has
`api-calls.md` (failed API calls with a curl to reproduce them, the curl uses `$TOKEN`
so paste a valid one first). UI tests also get `browser-log.md` with the page URL,
failed browser API calls and console errors.

The Allure report is the readable one. It shows only the test steps, like
"Create product" or "Add to cart", not every click.
It groups failures by cause, like login failed, cleanup failed, API server error
or timeout. It links known bugs to their GitHub issue and keeps history between runs,
so new and flaky tests stand out.

```bash
npm run report:allure
```

The terminal also prints a short summary at the end of a run when there is
something to know: how many known bugs still fail as expected, a known bug that
started passing (close its issue and remove `test.fail`), and tests that passed
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
