import { test, expect } from '@playwright/test';

test('should apply price filter', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('product-name')).toHaveCount(9);

  const firstElementBeforeFiltering = await page
    .getByTestId('product-name')
    .first()
    .innerText();

  await page.getByRole('slider', { name: 'ngx-slider-max' }).press('End');

  await page
    .getByRole('slider', { name: 'ngx-slider', exact: true })
    .press('Home');
  for (let i = 0; i < 5; i++) {
    await page
      .getByRole('slider', { name: 'ngx-slider', exact: true })
      .press('PageUp');
  }

  await expect(
    page.getByRole('slider', { name: 'ngx-slider-max' })
  ).toHaveAttribute('aria-valuenow', '200');
  await expect(
    page.getByRole('slider', { name: 'ngx-slider', exact: true })
  ).toHaveAttribute('aria-valuenow', '100');

  await expect(page.getByTestId('product-name')).toHaveCount(5);

  await expect(page.getByTestId('product-name').first()).not.toHaveText(
    firstElementBeforeFiltering
  );
});

test('should search and reset search results', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('product-name')).toHaveCount(9);

  const firstElementBeforeSearching = await page
    .getByTestId('product-name')
    .first()
    .innerText();

  await page.getByPlaceholder('Search').fill('Protective Gloves');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByTestId('product-name')).toHaveCount(1);

  await expect(page.getByTestId('product-name').first()).not.toHaveText(
    firstElementBeforeSearching
  );

  await expect(page.getByTestId('product-name').first()).toHaveText(
    'Protective Gloves'
  );

  await page.getByRole('button', { name: 'X' }).click();
  await expect(page.getByTestId('product-name').first()).toHaveText(
    firstElementBeforeSearching
  );

  await expect(page.getByTestId('product-name')).toHaveCount(9);
});

test('should paginate', async ({ page }) => {
  await page.goto('/');

  const firstElementBeforePagination = await page
    .getByTestId('product-name')
    .first()
    .innerText();

  const productTitlesBeforePagination = await page
    .getByTestId('product-name')
    .allTextContents();

  await page.getByRole('listitem').filter({ hasText: '5' }).click();

  // page is truly reloaded
  await expect(page.getByTestId('product-name').first()).not.toHaveText(
    firstElementBeforePagination
  );

  const productTitlesAfterPagination = await page
    .getByTestId('product-name')
    .allTextContents();

  expect(
    productTitlesAfterPagination.every(
      (title) => !productTitlesBeforePagination.includes(title)
    )
  ).toBe(true);
});

// Note: use deligation when make POM for the shop component for different pages!
