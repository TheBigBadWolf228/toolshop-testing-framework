import { test, expect } from '@playwright/test';
import { CO2_SORT, DRILL_FILTER } from './data/shop.js';
import { CategoryPage } from './pages/category.page.js';
import { HomePage } from './pages/home.page.js';

test('should sort hand tools by CO2 rating from A to E', async ({ page }) => {
  const homePage = new HomePage(page);
  const categoryPage = new CategoryPage(page);
  await homePage.open();
  await homePage.header.openCategory(CO2_SORT.category);
  await expect(categoryPage.title).toHaveText(`Category: ${CO2_SORT.category}`);

  await categoryPage.sortBy(CO2_SORT.option);

  await expect(async () => {
    const ratings = await categoryPage.grid.readCo2Ratings();
    expect(ratings).toEqual([...ratings].sort());
    expect(new Set(ratings).size).toBeGreaterThan(1);
  }).toPass({ timeout: 10_000 });
});

test('should show only MightyCraft drills in power tools', async ({ page }) => {
  const homePage = new HomePage(page);
  const categoryPage = new CategoryPage(page);
  await homePage.open();
  await homePage.header.openCategory(DRILL_FILTER.category);
  await expect(categoryPage.title).toHaveText(
    `Category: ${DRILL_FILTER.category}`
  );

  await categoryPage.filters.check(DRILL_FILTER.type);
  await expect
    .poll(async () => (await categoryPage.grid.readNames()).sort())
    .toEqual(DRILL_FILTER.drills);

  await categoryPage.filters.check(DRILL_FILTER.brand);
  await expect(categoryPage.grid.names).toHaveText(DRILL_FILTER.brandDrills);
});
