import { test, expect } from '@playwright/test';

const email = 'customer@practicesoftwaretesting.com';
const password = 'welcome01';

test('should login with valid credentials', async ({ page }) => {
  await page.goto('/');

  await page.getByText('Sign In').click();
  await page.waitForURL(`/auth/login`);

  await page.getByPlaceholder('Your email').fill(email);
  await page.getByPlaceholder('Your password').fill(password);

  await page.getByRole('button', {name: 'Login'}).click();
  await page.waitForURL(`/account`);
  
  await expect(page.getByRole('heading', {name: 'My account'})).toBeVisible();

  await page.getByRole('button', {name: 'Jane Doe'}).click();
  await page
    .getByRole('listitem')
    .filter({hasText: 'Sign out'})
    .click();

  await page.waitForURL(`/auth/login`);
  await expect(page.getByRole('heading', {name: 'Login'})).toBeVisible();
});

test('should not login with invalid credentials', async ({ page }) => {
  await page.goto('/');

  await page.getByText('Sign In').click();
  await page.waitForURL('/auth/login');

  await page.getByPlaceholder('Your email').fill('invalid@example.com');
  await page.getByPlaceholder('Your password').fill('qwerty123');
  await page.getByRole('button', {name: 'Login'}).click();

  await expect(page
    .getByText('Invalid email or password'))
    .toBeVisible();

  await expect(page).toHaveURL('/auth/login');
});
