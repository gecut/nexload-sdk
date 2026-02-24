import { IconCraftEngine } from "../core";
import { bold } from "colorette";
import ora from "ora";

export async function listIcons(outDir?: string) {
  const spinner = ora({
    text: "Starting",
    indent: 2,
  }).start();

  try {
    const iconCraft = await IconCraftEngine.build({
      outDir: outDir || "icons",
    });

    spinner.text = "Listing Icons";
    const icons = await iconCraft.listIcons();
    const iconNames = Object.keys(icons);

    spinner.stop();

    console.log(bold(`Found ${iconNames.length} icons:`));
    for (const name of iconNames) {
      console.log(`- ${name}`);
    }
  } catch (error: any) {
    process.exitCode = 1;
    spinner.fail(`Failed: ${error.message}`);
  } finally {
    spinner.stop();
  }
}
