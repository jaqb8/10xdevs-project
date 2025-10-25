import { test, expect } from "@playwright/test";
import { AnalyzePage, HeaderComponent, LearningListPage } from "./page-objects";

test.describe("Text Analysis and Save Flow", () => {
  let analyzePage: AnalyzePage;
  let header: HeaderComponent;
  let learningListPage: LearningListPage;

  test.beforeEach(async ({ page }) => {
    analyzePage = new AnalyzePage(page);
    header = new HeaderComponent(page);
    learningListPage = new LearningListPage(page);
  });

  test("should analyze text with error and save to learning list", async ({ page }) => {
    // Arrange
    const textWithError = "I is a student. He go to school.";

    // Act - Navigate to analyze page
    await analyzePage.goto();
    await expect(analyzePage.heading).toBeVisible();

    // Assert - User is logged in
    await expect(header.logoutButton).toBeVisible();

    // Act - Fill and submit analysis
    await analyzePage.form.fillText(textWithError);
    await analyzePage.form.submitAnalysis();

    // Assert - Loading state appears
    await expect(analyzePage.result.loadingState).toBeVisible();

    // Act - Wait for result
    await analyzePage.result.waitForResult();

    // Assert - Result with errors is displayed
    await expect(analyzePage.result.errorResult).toBeVisible();
    await expect(analyzePage.result.explanation).toBeVisible();
    await expect(analyzePage.result.textDiffContainer).toBeVisible();

    // Assert - Original and corrected text are shown
    const originalText = await analyzePage.result.getOriginalText();
    const correctedText = await analyzePage.result.getCorrectedText();
    expect(originalText).toBeTruthy();
    expect(correctedText).toBeTruthy();

    // Act - Save to learning list
    await analyzePage.result.saveToLearningList();

    // Assert - Success toast appears
    await expect(page.getByText(/zapisano na liście do nauki/i)).toBeVisible();

    // Assert - Save button shows saved state
    await expect(analyzePage.result.saveButton).toContainText(/zapisano/i);

    // Act - Navigate to learning list
    await header.navigateToLearningList();

    // Assert - Item appears in learning list
    await expect(learningListPage.heading).toBeVisible();
    await learningListPage.waitForItems();
    const itemsCount = await learningListPage.getItemsCount();
    expect(itemsCount).toBeGreaterThan(0);
  });

  test("should show correct result for text without errors", async ({ page }) => {
    // Arrange
    const correctText = "This sentence has no grammar errors.";

    // Act - Navigate to analyze page
    await analyzePage.goto();
    await expect(analyzePage.heading).toBeVisible();

    // Act - Fill text and wait for it to be ready
    await analyzePage.form.fillText(correctText);
    await expect(analyzePage.form.textInput).toHaveValue(correctText);

    // Act - Submit analysis
    await analyzePage.form.submitAnalysis();
    await analyzePage.result.waitForLoading();
    await analyzePage.result.waitForResult();

    // Assert - Correct result is shown
    await expect(analyzePage.result.correctResult).toBeVisible();
    await expect(page.getByText(/świetna robota/i)).toBeVisible();
    await expect(analyzePage.result.saveButton).not.toBeVisible();
  });

  test("should disable submit button when text is empty", async ({ page }) => {
    // Arrange
    const testText = "Some text";

    // Act - Navigate to analyze page
    await analyzePage.goto();
    await expect(analyzePage.heading).toBeVisible();

    // Assert - Submit button is disabled when empty
    await expect(analyzePage.form.submitButton).toBeDisabled();

    // Act - Fill text
    await analyzePage.form.fillText(testText);

    // Assert - Text is filled and submit button is enabled
    await expect(analyzePage.form.textInput).toHaveValue(testText);
    await expect(analyzePage.form.submitButton).toBeEnabled();

    // Act - Clear form
    await analyzePage.form.clearForm();

    // Assert - Text is cleared and submit button is disabled again
    await expect(analyzePage.form.textInput).toHaveValue("");
    await expect(analyzePage.form.submitButton).toBeDisabled();
  });

  test("should show character count", async ({ page }) => {
    // Arrange
    const testText = "Hello world";

    // Act - Navigate to analyze page
    await analyzePage.goto();
    await expect(analyzePage.heading).toBeVisible();

    // Act - Fill text
    await analyzePage.form.fillText(testText);

    // Assert - Character count is updated and displayed correctly
    await expect(analyzePage.form.charCount).toContainText(`${testText.length} / 500`);
  });
});
