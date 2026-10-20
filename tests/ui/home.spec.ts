import { test, expect } from './support/fixtures.js';
import {
  PAGINATION_TARGET_PAGE,
  PRICE_RANGE,
  SEARCH_TERM,
} from './data/shop.js';

test('should show only products within the price range', async ({
  homePage,
}) => {
  await homePage.open();

  await homePage.filters.setPriceRange(PRICE_RANGE.min, PRICE_RANGE.max);

  await expect(homePage.filters.minPriceSlider).toHaveAttribute(
    'aria-valuenow',
    String(PRICE_RANGE.min)
  );
  await expect(homePage.filters.maxPriceSlider).toHaveAttribute(
    'aria-valuenow',
    String(PRICE_RANGE.max)
  );

  await expect(async () => {
    const prices = await homePage.grid.readPrices();
    const outOfRange = prices.filter(
      (price) => price < PRICE_RANGE.min || price > PRICE_RANGE.max
    );
    expect(prices.length).toBeGreaterThan(0);
    expect(outOfRange).toEqual([]);
  }).toPass({ timeout: 10_000 });
});

test('should find a product by name and reset the search', async ({
  homePage,
}) => {
  await homePage.open();
  const namesBeforeSearch = await homePage.grid.readNames();

  await homePage.search(SEARCH_TERM);
  await expect(homePage.grid.names).toHaveText([SEARCH_TERM]);

  await homePage.resetSearch();
  await expect(homePage.grid.names).toHaveText(namesBeforeSearch);
});

test('should show different products on another page', async ({ homePage }) => {
  await homePage.open();
  const firstPageNames = await homePage.grid.readNames();

  await homePage.goToPage(PAGINATION_TARGET_PAGE);

  await expect(async () => {
    const otherPageNames = await homePage.grid.readNames();
    const repeated = otherPageNames.filter((name) =>
      firstPageNames.includes(name)
    );
    expect(otherPageNames.length).toBeGreaterThan(0);
    expect(repeated).toEqual([]);
  }).toPass({ timeout: 10_000 });
});
