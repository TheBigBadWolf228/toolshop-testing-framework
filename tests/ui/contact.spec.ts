import { test, expect } from './support/fixtures.js';
import { CONTACT, CONTACT_ERRORS } from './data/shop.js';

test.describe('as anonymous', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.open();
    await expect(contactPage.firstName).toBeVisible();
  });

  test('should show an error for every required field', async ({
    contactPage,
  }) => {
    await contactPage.send();

    await expect(contactPage.errors).toHaveText([...CONTACT_ERRORS.required]);
  });

  test('should reject an invalid email and a too-short message', async ({
    contactPage,
  }) => {
    await contactPage.fillAsGuest({
      firstName: CONTACT.firstName,
      lastName: CONTACT.lastName,
      email: CONTACT.invalidEmail,
      subject: CONTACT.subject.label,
      message: CONTACT.tooShortMessage,
    });
    await contactPage.send();

    await expect(contactPage.errors).toHaveText([
      CONTACT_ERRORS.invalidEmail,
      CONTACT_ERRORS.messageTooShort,
    ]);
  });
});

test.describe('as a new customer', () => {
  test('should send a message and list it in my messages', async ({
    freshCustomer: { user },
    contactPage,
    messagesPage,
  }) => {
    await contactPage.open();
    await expect(contactPage.greeting).toContainText(
      `${user.first_name} ${user.last_name}`
    );

    await contactPage.fillAsCustomer({
      subject: CONTACT.subject.label,
      message: CONTACT.message,
    });
    await contactPage.send();
    await expect(contactPage.sentAlert).toBeVisible();

    await messagesPage.open();
    await expect(messagesPage.heading).toBeVisible();
    await expect(messagesPage.status(CONTACT.subject.value)).toHaveText(
      CONTACT.status
    );
  });
});
