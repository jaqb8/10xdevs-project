import { type Page, type Locator } from "@playwright/test";

export class AnalysisFormComponent {
  readonly page: Page;
  readonly textInput: Locator;
  readonly submitButton: Locator;
  readonly clearButton: Locator;
  readonly charCount: Locator;
  readonly modeSelector: Locator;
  readonly grammarModeOption: Locator;
  readonly colloquialModeOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textInput = page.getByRole("textbox", { name: /wprowadź tekst do analizy/i });
    this.submitButton = page.getByRole("button", { name: /analizuj tekst/i });
    this.clearButton = page.getByRole("button", { name: /wyczyść/i });
    this.charCount = page.locator("#char-count");
    this.modeSelector = page.locator("[data-test-id='analysis-mode-selector']");
    this.grammarModeOption = page.locator("[data-test-id='mode-grammar']");
    this.colloquialModeOption = page.locator("[data-test-id='mode-colloquial']");
  }

  async fillText(text: string) {
    await this.textInput.clear();
    await this.textInput.pressSequentially(text, { delay: 0 });
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

  async selectMode(mode: "grammar" | "colloquial") {
    const currentMode = await this.getSelectedMode();
    const modeLabel = mode === "grammar" ? "Gramatyka i ortografia" : "Mowa potoczna";

    if (currentMode?.includes(modeLabel)) {
      return;
    }

    await this.modeSelector.click();

    const modeTestId = mode === "grammar" ? "mode-grammar" : "mode-colloquial";
    const modeOption = this.page.locator(`[data-test-id="${modeTestId}"]`);

    await modeOption.waitFor({ state: "visible", timeout: 10000 });
    await modeOption.click();
  }

  async getSelectedMode() {
    return await this.modeSelector.textContent();
  }
}
