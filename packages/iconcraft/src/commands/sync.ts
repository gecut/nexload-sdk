import { IconCraftEngine } from "../core";
import { bold, dim } from "colorette";
import ora from "ora";

export async function syncIcons(outDir?: string) {
  const spinner = ora({
    text: "Starting",
    indent: 2,
  }).start();

  try {
    const iconCraft = await IconCraftEngine.build({
      outDir: outDir || "icons",
    });

    spinner.text = "Syncing Icons";
    await iconCraft.sync();

    spinner.succeed([dim("Synced"), bold("icons")].join(" "));
  } catch (error: any) {
    spinner.fail(`Failed: ${error.message}`);
  }

  spinner.stop();
}
