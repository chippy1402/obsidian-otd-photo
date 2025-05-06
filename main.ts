// src/main.ts
import { Plugin, TFolder, TFile } from "obsidian";

export default class OTDPhotoPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("OTD-Photo", async (source, el, ctx) => {
      const lines = source.split(/\r?\n/);
      const config: Record<string, string> = {};

      // Parse key=value pairs from the block
      for (const line of lines) {
        const [key, value] = line.split("=").map(s => s.trim());
        if (key && value) config[key.toLowerCase()] = value.replace(/^"|"$/g, "");
      }

      // Extended options
      const useFileName = config.usefilename === "true";
      const fallback = config.fallbacktotoday === "true";
      const base = config.basepath || "Journal_Photos";
      const today = window.moment().format("YYYY-MM-DD");

      let datePath = config.path;

      // Mobile-safe rendering: simple vertical list of images
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        const folderPath = base + '/' + (datePath || today);
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (folder && folder instanceof TFolder) {
          const children = folder.children.filter(f => f instanceof TFile && f.extension.match(/jpg|jpeg|png|gif/i));
          for (const file of children) {
            const p = el.createEl("p");
            p.innerText = `![[${folderPath}/${file.name}]]`;
          }
        } else {
          el.createEl("p", { text: `No folder found for path: ${folderPath}` });
        }
        return;
      }

      if (!datePath && useFileName) {
        const fileName = ctx.sourcePath.split("/").pop() || "";
        const match = fileName.match(/\d{4}-\d{2}-\d{2}/);
        datePath = match?.[0] || "";

        console.log("OTD-Photo config:", config);
        console.log("ctx.sourcePath:", ctx.sourcePath);
        console.log("File name extracted:", fileName);
        console.log("Date match:", match?.[0]);
        console.log("Final datePath:", datePath);
      }

      if (!datePath && fallback) {
        datePath = today;
        console.log("Falling back to today's date:", today);
      }

      const folderPath = `${base}/${datePath || today}`;
      const style = config.style || "horizontal";
      const columns = parseInt(config.columns || "4");

      console.log("Final folder path:", folderPath);

      // Check or create folder
      let folder = (this as Plugin).app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        try {
          await (this as Plugin).app.vault.createFolder(folderPath);
        } catch (err) {
          el.createEl("p", { text: `⚠️ Error creating folder: ${folderPath}` });
          return;
        }
      }

      // Refresh folder reference after creating
      folder = (this as Plugin).app.vault.getAbstractFileByPath(folderPath);
      if (folder instanceof TFolder) {
        const imageFiles = folder.children.filter(f => f.name.match(/\.(jpg|jpeg|png|gif)$/i));

        if (imageFiles.length === 0) {
          el.createEl("p", { text: `📷 No images found in ${folderPath}` });
          return;
        }

        const gallery = el.createDiv({ cls: `otd-gallery ${style}` });
        gallery.style.display = "grid";
        gallery.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gallery.style.gap = "10px";

        for (const file of imageFiles) {
          if (file instanceof TFile) {
            const link = gallery.createEl("a", {
              href: "#"
            });

            link.onclick = (e) => {
              e.preventDefault();
              (this as Plugin).app.workspace.getLeaf().openFile(file);
            };

            const img = link.createEl("img");
            img.src = (this as Plugin).app.vault.getResourcePath(file);
            img.alt = file.name;
            img.style.width = "100%";
            img.style.borderRadius = "8px";
          } else {
            console.warn(`Skipping non-file item: ${file.name}`);
          }
        }
      } else {
        el.createEl("p", { text: `📁 Folder not found: ${folderPath}` });
      }
    });
  }

  onunload() {}
}
