import { type Page, type Locator } from "@playwright/test";

export class AnalysisFormComponent {
  readonly page: Page;
  readonly textInput: Locator;
  readonly submitButton: Locator;
  readonly clearButton: Locator;
  readonly charCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textInput = page.getByRole("textbox", { name: /wprowadź tekst do analizy/i });
    this.submitButton = page.getByRole("button", { name: /analizuj tekst/i });
    this.clearButton = page.getByRole("button", { name: /wyczyść/i });
    this.charCount = page.locator("#char-count");
  }

  async fillText(text: string) {
    await this.textInput.fill(text);
  }

  async submitAnalysis() {
    await this.submitButton.click();
  }

  async clearForm() {
    await this.clearButton.click();
  }

  async getCharCount() {
    return await this.charCount.textContent();
  }

  async isSubmitButtonDisabled() {
    return await this.submitButton.isDisabled();
  }

  async waitForAnalyzing() {
    await this.submitButton.getByText(/analizuję/i).waitFor();
  }
}
