import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");

    // Check if login form elements are present
    await expect(page.getByText("Logowanie")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Hasło")).toBeVisible();
    await expect(page.getByRole("button", { name: "Zaloguj się" })).toBeVisible();
  });

  test("should redirect unauthenticated user from protected route", async ({ page }) => {
    await page.goto("/learning-list");

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("invalid@example.com");
    await page.getByLabel("Hasło").fill("wrongpassword");
    await page.getByRole("button", { name: "Zaloguj się" }).click();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);

    // Check if error message appears in toast
    await expect(page.getByText("Wystąpił błąd podczas logowania.")).toBeVisible({ timeout: 5000 });
  });
});
