import { test, expect } from '@playwright/test';

test('hand tools shop should sort', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Categories'}).click();
    await page
    .getByRole('listitem')
    .filter({hasText: 'Hand Tools'})
    .click();

    await page.waitForURL(`/category/hand-tools`);

    // save the first element in the list before sorting: Figure out what's wrong here!
    const firstElementBeforeSorting = await page
        .getByTestId('sorting_completed')
        .getByRole('link')
        .getByRole('heading')
        .first()
    
    console.log('First element before sorting: ', `${firstElementBeforeSorting}`);    
    /*
    await page.getByTestId('sort').click();
    await page
        .getByTestId('sort')
        .filter({hasText: 'CO₂ Rating (A - E)'})
        .click();
    
    const secondElementAfterSorting = await page
        .getByTestId('sorting_completed')
        .getByRole('link')
        .getByRole('heading', {level: 5})
        .first()
        .innerText();
        
    expect(firstElementBeforeSorting).not.toEqual(secondElementAfterSorting);
    
    */
});
