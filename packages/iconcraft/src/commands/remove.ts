import { IconCraftEngine } from "@/core";
import { bold, dim } from "colorette";
import ora from "ora";

export async function removeIcon(name?: string, outDir?: string) {
  const spinner = ora({
    text: "Starting",
    indent: 2,
  }).start();

  try {
    const iconCraft = await IconCraftEngine.build({
      outDir: outDir || "icons",
    });

    spinner.text = "Removing Icon";
    const meta = await iconCraft.removeIcon(name!);

    if (!meta) {
      throw new Error("Icon not found");
    }

    spinner.succeed([dim("Removed"), bold(name!)].join(" "));
  } catch (error: any) {
    spinner.fail(`Failed: ${error.message}`);
  }

  spinner.stop();
}
