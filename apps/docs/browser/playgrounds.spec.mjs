import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";

const base = "/nexload-sdk/packages/";
const cases = [
  ["persian", "IRR", "۱۲۵۰۰", "IRT", "۱٬۲۵۰"],
  ["payload-schema", "Title", " ab ", "SKU", '"AB"'],
  ["healthcheck/core", "JSON", "unhealthy", "OpenMetrics", "# EOF"],
  ["healthcheck/prometheus", "Prometheus", "degraded", "JSON", '"degraded"'],
  ["healthcheck/otel", "OTel", "ok", "Prometheus", "nexload_health_status"],
];

for (const [path, initial, input, mode, result] of cases) {
  test(`${path} updates, shares and restores state at mobile width`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(base + path + "/playground/");
    const lab = page.getByRole("group", { name: "Try a sample" });
    const field = lab.getByRole("textbox");
    const menu = lab.getByRole("combobox");
    const output = lab.locator("output");
    await expect(menu).toHaveValue(initial);
    await expect(output).not.toBeEmpty();
    await field.fill(input);
    await field.press("Tab");
    await expect(menu).toBeFocused();
    await menu.selectOption(mode);
    await expect(output).toContainText(result);
    const href = await lab.getByRole("link", { name: "Share these settings" }).getAttribute("href");
    await page.goto("about:blank");
    await page.goto(href);
    await expect(field).toHaveValue(input);
    await expect(menu).toHaveValue(mode);
    await expect(output).toContainText(result);
    await expect(field).toHaveAttribute("dir", "auto");
    expect(await lab.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}

test("unknown mode and oversized fragment cannot break the price form", async ({ page }) => {
  await page.goto(base + "persian/playground/#try?mode=unknown&input=" + "9".repeat(150));
  await expect(page.locator("fieldset select")).toHaveValue("IRR");
  await expect(page.locator("fieldset input")).toHaveValue("9".repeat(120));
  await expect(page.locator("fieldset output")).toContainText("whole number");
});

test("server-rendered playground instructions survive disabled JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4328" + base + "payload-schema/playground/");
  await expect(page.getByText("Enable JavaScript to change the sample and see the result.")).toBeVisible();
  await context.close();
});

test("incremental compressed JavaScript stays within the island budgets", async ({ browser }) => {
  async function scriptBytes(path) {
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:4328/nexload-sdk/" + path);
    if (path.includes("playground")) await expect(page.locator("fieldset output")).not.toBeEmpty();
    await page.waitForLoadState("networkidle");
    const sources = await page.evaluate(() => performance.getEntriesByType("resource")
      .map(entry => entry.name).filter(url => new URL(url).pathname.endsWith(".js")));
    const bytes = new Map();
    for (const src of new Set(sources)) bytes.set(src, gzipSync(await (await page.request.get(src)).body()).length);
    await page.close();
    return bytes;
  }
  const baseline = await scriptBytes("start/choose-a-package/");
  for (const [path, limit] of [["persian", 32], ["healthcheck/core", 64], ["payload-schema", 128]]) {
    const loaded = await scriptBytes("packages/" + path + "/playground/");
    const incremental = [...loaded].filter(([src]) => !baseline.has(src)).reduce((sum, [, size]) => sum + size, 0);
    expect(incremental).toBeGreaterThan(0);
    expect(incremental).toBeLessThanOrEqual(limit * 1024);
  }
});
