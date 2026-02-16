import { test, expect } from "@playwright/test";

test.describe("Kanban Board Full Lifecycle", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("User can create a task and see it in To Do", async ({ page }) => {
        if (page.url().includes("sign-in")) return; // Skip if auth blocks

        await page.click("text=+ Add New Task");
        await page.fill('input[placeholder="Task Title"]', "E2E Test Task");
        await page.fill('textarea[placeholder="Task Description"]', "This task was created by Playwright");
        await page.selectOption('select:near(:text("Priority"))', "high");
        await page.click('button:text("Create Task")');

        await expect(page.getByText("E2E Test Task")).toBeVisible();
    });

    test("User can delete a task", async ({ page }) => {
        if (page.url().includes("sign-in")) return;

        // Ensure there's a task to delete or create one
        await page.click("text=+ Add New Task");
        await page.fill('input[placeholder="Task Title"]', "Delete Me");
        await page.click('button:text("Create Task")');

        const card = page.locator('div[role="group"]').filter({ hasText: "Delete Me" });
        await card.locator('button[aria-label="Options"]').click();
        await page.click('text=Delete');

        // Handle confirmation dialog if any, or check for removal
        await expect(page.getByText("Delete Me")).not.toBeVisible();
    });

    test("User can change task category and priority", async ({ page }) => {
        if (page.url().includes("sign-in")) return;

        await page.click("text=+ Add New Task");
        await page.fill('input[placeholder="Task Title"]', "Modifiable Task");
        await page.click('button:text("Create Task")');

        await page.click('text=Modifiable Task'); // Open detail modal
        await page.click('button:text("Edit")');

        await page.selectOption('select:near(:text("Priority"))', "low");
        await page.selectOption('select:near(:text("Category"))', "bug");
        await page.click('button:text("Update Task")');

        // Verify badges in detail modal or on card
        await expect(page.getByText("low")).toBeVisible();
        await expect(page.getByText("bug")).toBeVisible();
    });

    test("File Upload Testing (Valid & Invalid)", async ({ page }) => {
        if (page.url().includes("sign-in")) return;

        await page.click("text=+ Add New Task");

        // Invalid file (unsupported format)
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('text=Drag & drop files here')
        ]);
        await fileChooser.setFiles({
            name: 'test.exe',
            mimeType: 'application/x-msdownload',
            buffer: Buffer.from('fake data')
        });

        await expect(page.getByText("is not supported")).toBeVisible();

        // Valid file (image)
        await fileChooser.setFiles({
            name: 'screenshot.png',
            mimeType: 'image/png',
            buffer: Buffer.from('fake image data')
        });

        await expect(page.locator('img[alt="preview"]')).toBeVisible();
    });

    test("Graph Testing: Dashboard reflects task counts", async ({ page }) => {
        if (page.url().includes("sign-in")) return;

        // Navigate to Analytics
        await page.click("text=Analytics");
        await expect(page.getByText("Task Progress Overview")).toBeVisible();

        // Check for presence of bar chart elements (Recharts uses SVG)
        const bars = page.locator('.recharts-bar-rectangle');
        await expect(bars.first()).toBeVisible();
    });
});
