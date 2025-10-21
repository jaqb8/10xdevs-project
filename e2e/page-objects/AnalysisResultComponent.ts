import { type Page, type Locator } from "@playwright/test";

export class AnalysisResultComponent {
  readonly page: Page;
  readonly loadingState: Locator;
  readonly correctResult: Locator;
  readonly errorResult: Locator;
  readonly explanation: Locator;
  readonly saveButton: Locator;
  readonly textDiffContainer: Locator;
  readonly originalText: Locator;
  readonly correctedText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loadingState = page.getByRole("status", { name: /ładowanie wyników analizy/i });
    this.correctResult = page.getByRole("status", { name: /wynik analizy - tekst poprawny/i });
    this.errorResult = page.getByRole("article", { name: /wynik analizy - znaleziono błędy/i });
    this.explanation = page.locator(".rounded-md.bg-muted.p-3").filter({ hasText: /.+/ }).first();
    this.saveButton = page.getByRole("button", { name: /dodaj.*do listy|element już zapisany|zaloguj się.*dodać/i });
    this.textDiffContainer = page.getByRole("region", { name: /porównanie tekstu/i });
    this.originalText = page.getByLabel(/tekst oryginalny z zaznaczonymi błędami/i);
    this.correctedText = page.getByLabel(/tekst poprawiony z zaznaczonymi zmianami/i);
  }

  async waitForLoading() {
    await this.loadingState.waitFor({ state: "visible" });
  }

  async waitForResult() {
    await this.loadingState.waitFor({ state: "hidden" });
  }

  async isCorrectResult() {
    return await this.correctResult.isVisible();
  }

  async hasErrors() {
    return await this.errorResult.isVisible();
  }

  async getExplanation() {
    return await this.explanation.textContent();
  }

  async saveToLearningList() {
    await this.saveButton.click();
  }

  async isSaved() {
    const buttonText = await this.saveButton.textContent();
    return buttonText?.includes("Zapisano");
  }

  async getOriginalText() {
    return await this.originalText.textContent();
  }

  async getCorrectedText() {
    return await this.correctedText.textContent();
  }

  async waitForSaveButton() {
    await this.saveButton.waitFor({ state: "visible" });
  }
}
