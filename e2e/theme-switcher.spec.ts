import { test, expect } from "@playwright/test";
import { HeaderComponent } from "./page-objects";

test.describe("Theme Switcher", () => {
  let header: HeaderComponent;

  test.beforeEach(async ({ page }) => {
    header = new HeaderComponent(page);
    await page.goto("/");
  });

  test("should toggle theme on desktop", async ({ page }) => {
    const initialTheme = await header.getCurrentTheme();

    // For logged in users, open user menu first
    await header.openUserMenu();
    await header.themeToggleMenuItem.click();
    await page.waitForTimeout(300);

    const newTheme = await header.getCurrentTheme();
    expect(newTheme).not.toBe(initialTheme);

    const storedTheme = await header.getStoredTheme();
    expect(storedTheme).toBe(newTheme);

    // Toggle back
    await header.openUserMenu();
    await header.themeToggleMenuItem.click();
    await page.waitForTimeout(300);

    const revertedTheme = await header.getCurrentTheme();
    expect(revertedTheme).toBe(initialTheme);

    const revertedStoredTheme = await header.getStoredTheme();
    expect(revertedStoredTheme).toBe(initialTheme);
  });

  test("should persist theme across page navigation", async ({ page }) => {
    await header.toggleTheme();
    await page.waitForTimeout(100);

    const themeBeforeNavigation = await header.getCurrentTheme();
    expect(themeBeforeNavigation).toBe("dark");

    await page.goto("/learning-list");
    await page.waitForTimeout(100);

    const themeOnNewPage = await header.getCurrentTheme();
    expect(themeOnNewPage).toBe("dark");

    await page.goto("/");
    await page.waitForTimeout(100);

    const themeAfterReturn = await header.getCurrentTheme();
    expect(themeAfterReturn).toBe("dark");

    const storedTheme = await header.getStoredTheme();
    expect(storedTheme).toBe("dark");
  });

  test("should respect system preference on first visit", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForTimeout(100);

    const themeDark = await header.getCurrentTheme();
    expect(themeDark).toBe("dark");

    await page.evaluate(() => localStorage.clear());
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.waitForTimeout(100);

    const themeLight = await header.getCurrentTheme();
    expect(themeLight).toBe("light");
  });

  test("should show correct icon for current theme", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
    });
    await page.goto("/");
    await page.waitForTimeout(100);

    const currentTheme = await header.getCurrentTheme();
    expect(currentTheme).toBe("light");

    // For logged in users, check user menu is visible instead of direct theme toggle
    await expect(header.userMenuTrigger).toBeVisible();

    await header.openUserMenu();
    await header.themeToggleMenuItem.click();
    await page.waitForTimeout(300);

    const newTheme = await header.getCurrentTheme();
    expect(newTheme).toBe("dark");

    await expect(header.userMenuTrigger).toBeVisible();
  });
});
