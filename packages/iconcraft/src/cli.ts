import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { addIcon, listIcons, removeIcon, syncIcons } from "./commands";

yargs(hideBin(process.argv))
  .scriptName("iconcraft")
  .usage("$0 <command> [options]")
  .option("out-dir", {
    alias: "o",
    describe: "Custom output directory for generated icons",
    type: "string",
    default: "icons",
  })
  .command(
    "add <name>",
    "Add a new icon to the project",
    (y) => {
      return y.positional("name", {
        describe: "Iconify icon name (e.g. mdi:home)",
        type: "string",
      });
    },
    async (args) => {
      await addIcon(args.name, args.outDir);
    }
  )
  .command(
    "remove <name>",
    "Remove an icon",
    (y) => {
      return y.positional("name", {
        describe: "Icon name to remove",
        type: "string",
      });
    },
    async (args) => {
      await removeIcon(args.name, args.outDir);
    }
  )
  .command(
    "list",
    "List all cached/generated icons",
    () => {},
    async (args) => {
      await listIcons(args.outDir);
    }
  )
  .command(
    "sync",
    "Sync icons with the meta file",
    () => {},
    async (args) => {
      await syncIcons(args.outDir);
    }
  )
  .demandCommand(1)
  .help()
  .strict()
  .parse();
