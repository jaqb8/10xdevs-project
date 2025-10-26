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
  readonly themeToggleButton: Locator;
  readonly themeToggleButtonMobile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole("link", { name: /language learning buddy/i });
    this.analyzeLink = page.getByRole("link", { name: /^analiza$/i });
    this.learningListLink = page.getByRole("link", { name: /moja lista/i });
    this.loginButton = page.getByRole("link", { name: /zaloguj/i });
    this.signupButton = page.getByRole("link", { name: /zarejestruj/i });
    this.logoutButton = page.getByRole("button", { name: /wyloguj/i });
    this.userEmail = page.getByText(/.*@.*\..*/);
    this.mobileMenuTrigger = page.getByTestId("header-mobile-menu-trigger");
    this.themeToggleButton = page.locator("nav.hidden button[data-test-id='theme-toggle-button']");
    this.themeToggleButtonMobile = page.locator("div.block button[data-test-id='theme-toggle-button']");
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

  async toggleTheme() {
    await this.themeToggleButton.click();
  }

  async toggleThemeMobile() {
    await this.mobileMenuTrigger.click();
    await this.themeToggleButtonMobile.click();
  }

  async getCurrentTheme() {
    const htmlElement = this.page.locator("html");
    const isDark = await htmlElement.evaluate((el) => el.classList.contains("dark"));
    return isDark ? "dark" : "light";
  }

  async getStoredTheme() {
    return await this.page.evaluate(() => localStorage.getItem("theme"));
  }
}
