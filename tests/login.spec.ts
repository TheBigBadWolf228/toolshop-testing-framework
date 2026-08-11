import { test, expect } from '@playwright/test';

const defaultUrl = 'https://practicesoftwaretesting.com';
const email = 'customer@practicesoftwaretesting.com';
const password = 'welcome01';

test('should login with valid credentials', async ({ page }) => {
  await page.goto(defaultUrl);

  await page.getByText('Sign In').click();
  await page.waitForURL(`${defaultUrl}/auth/login`);

  await page.getByPlaceholder('Your email').fill(email);
  await page.getByPlaceholder('Your password').fill(password);

  await page.getByRole('button', {name: 'Login'}).click();
  await page.waitForURL(`${defaultUrl}/account`);
  
  await page.getByRole('heading', {name: 'My account'}).isVisible();

  await page.getByRole('button', {name: 'Jane Doe'}).click();
  await page
    .getByRole('listitem')
    .filter({hasText: 'Sign out'})
    .click();

  await page.waitForURL(`${defaultUrl}/auth/login`);
  await page.getByRole('heading', {name: 'Login'});
});

test('should not login with invalid credentials', async ({ page }) => {
   await page.goto(defaultUrl);

  await page.getByText('Sign In').click();
  await page.waitForURL(`${defaultUrl}/auth/login`);

  await page.getByPlaceholder('Your email').fill('invalid@example.com');
  await page.getByPlaceholder('Your password').fill('qwerty123');
  await page.getByRole('button', {name: 'Login'}).click();

  await page
    .getByRole('alert')
    .filter({hasText: 'Invalid email or password'})
    .isVisible();
  
  await page.waitForURL(`${defaultUrl}/auth/login`);
});
