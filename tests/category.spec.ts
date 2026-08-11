import { test, expect } from '@playwright/test';

test.skip('hand tools shop should sort and filter', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Categories'}).click();
    await page
    .getByRole('listitem')
    .filter({hasText: 'Hand Tools'})
    .click();

    await page.waitForURL(`/category/hand-tools`);
});
