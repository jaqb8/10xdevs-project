import { type Page, type Locator } from "@playwright/test";

export class HeaderComponent {
  readonly page: Page;
  readonly logo: Locator;
  readonly analyzeLink: Locator;
  readonly learningListLink: Locator;
  readonly loginButton: Locator;
  readonly signupButton: Locator;
  readonly logoutButton: Locator;
  readonly userEmail: Locator;
  readonly mobileMenuTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole("link", { name: /language learning buddy/i });
    this.analyzeLink = page.getByRole("link", { name: /^analiza$/i });
    this.learningListLink = page.getByRole("link", { name: /moja lista/i });
    this.loginButton = page.getByRole("link", { name: /zaloguj/i });
    this.signupButton = page.getByRole("link", { name: /zarejestruj/i });
    this.logoutButton = page.getByRole("button", { name: /wyloguj/i });
    this.userEmail = page.getByText(/.*@.*\..*/);
    this.mobileMenuTrigger = page.getByRole("button", { name: /menu/i });
  }

  async navigateToAnalyze() {
    await this.analyzeLink.click();
  }

  async navigateToLearningList() {
    await this.learningListLink.click();
  }

  async navigateToLogin() {
    await this.loginButton.click();
  }

  async navigateToSignup() {
    await this.signupButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async isLoggedIn() {
    return await this.logoutButton.isVisible();
  }

  async getUserEmail() {
    return await this.userEmail.textContent();
  }

  async openMobileMenu() {
    await this.mobileMenuTrigger.click();
  }
}
