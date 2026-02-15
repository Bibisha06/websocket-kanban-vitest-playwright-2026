import { test, expect } from "@playwright/test";

test.describe("Kanban Board", () => {
    test("is protected and redirects to login", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveURL(/.*sign-in.*/);
    });
});
