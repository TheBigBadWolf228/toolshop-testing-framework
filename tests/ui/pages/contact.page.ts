import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export type CustomerContactForm = Pick<ContactForm, 'subject' | 'message'>;

export class ContactPage {
  static readonly path = '/contact';

  readonly heading: Locator;
  readonly greeting: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly sendButton: Locator;
  readonly errors: Locator;
  readonly sentAlert: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Contact' });
    this.greeting = page.getByText('please fill out this form');
    this.firstName = page.getByRole('textbox', { name: 'First name' });
    this.lastName = page.getByRole('textbox', { name: 'Last name' });
    this.email = page.getByRole('textbox', { name: 'Email address' });
    this.subject = page.getByRole('combobox', { name: 'Subject' });
    this.message = page.getByRole('textbox', { name: 'Message' });
    this.sendButton = page.getByRole('button', { name: 'Send' });
    this.errors = page.getByRole('alert');
    this.sentAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Thanks for your message!' });
  }

  @step('Open contact page')
  async open(): Promise<void> {
    await this.page.goto(ContactPage.path);
  }

  @step('Fill contact form as guest')
  async fillAsGuest(form: ContactForm): Promise<void> {
    await this.firstName.fill(form.firstName);
    await this.lastName.fill(form.lastName);
    await this.email.fill(form.email);
    await this.fillAsCustomer(form);
  }

  @step('Fill contact form as customer')
  async fillAsCustomer(form: CustomerContactForm): Promise<void> {
    await this.subject.selectOption({ label: form.subject });
    await this.message.fill(form.message);
  }

  @step('Send contact message')
  async send(): Promise<void> {
    await this.sendButton.click();
  }
}
