import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test("redirects unauthenticated users to sign-in", async ({ page }) => {

        await expect(page).toHaveURL(/.*sign-in.*/);

    });
});
