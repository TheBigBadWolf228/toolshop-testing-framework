import { test, expect } from '@playwright/test';

test('hand tools shop should sort', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Categories'}).click();
    await page
    .getByRole('listitem')
    .filter({hasText: 'Hand Tools'})
    .click();

    await page.waitForURL(`/category/hand-tools`);

    const firstElementBeforeSorting = await page
        .getByTestId('product-name')
        .first()
        .innerText();
    

    await page
        .getByTestId('sort')
        .selectOption('co2_rating,asc')

    await expect(page
        .getByTestId('product-name')
        .first())
        .not.toHaveText(firstElementBeforeSorting);  
});

test('power tools should filter', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Categories'}).click();
    await page
    .getByRole('listitem')
    .filter({hasText: 'Power Tools'})
    .click();

    await page.waitForURL(`/category/power-tools`);

    const firstElementBeforeFiltering = await page
        .getByTestId('product-name')
        .first()
        .innerText();
    

    await page.getByRole('checkbox', {name: 'Drill'}).check();
    await page.getByRole('checkbox', {name: 'MightyCraft Hardware'}).check();

    await expect(page
        .getByTestId('product-name')
        .first())
        .not.toHaveText(firstElementBeforeFiltering);  
});


