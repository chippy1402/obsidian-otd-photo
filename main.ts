// src/main.ts
import { Plugin, TFolder, TFile, Platform, MarkdownRenderer } from "obsidian";

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

      if (!datePath && useFileName) {
        const fileName = ctx.sourcePath.split("/").pop() || "";
        const match = fileName.match(/\d{4}-\d{2}-\d{2}/);
        datePath = match?.[0] || "";

        // Console logs for path determination - useful for initial setup, can be removed later
        console.log("OTD-Photo config:", config);
        console.log("ctx.sourcePath:", ctx.sourcePath);
        console.log("File name extracted:", fileName);
        console.log("Date match:", match?.[0]);
        console.log("Final datePath:", datePath);
      }

      if (!datePath && fallback) {
        datePath = today;
        console.log("Falling back to today's date:", today); // Console log
      }

      const folderPath = `${base}/${datePath || today}`;

      // Console logs for path finding - useful for initial setup, can be removed later
      console.log("OTD-Photo: Calculated folderPath:", folderPath);

      // Check or create folder
      let folder = (this as Plugin).app.vault.getAbstractFileByPath(folderPath);
      console.log("OTD-Photo: Folder object retrieved:", folder); // Console log

      if (!folder) {
        try {
          await (this as Plugin).app.vault.createFolder(folderPath);
          console.log("OTD-Photo: Folder created:", folderPath); // Console log
        } catch (err) {
          el.createEl("p", { text: `⚠️ Error creating folder: ${folderPath}` });
          console.error(`OTD-Photo: Error creating folder ${folderPath}:`, err); // Console log
          return;
        }
      }

      // Refresh folder reference after creating
      folder = (this as Plugin).app.vault.getAbstractFileByPath(folderPath);
      console.log("OTD-Photo: Folder object (after potential creation):", folder); // Console log


      if (folder instanceof TFolder) {
        // CORRECTED REGEX: Removed '\.' to match f.extension which doesn't include the dot
        const imageFiles = folder.children.filter(f =>
          f instanceof TFile && (f as TFile).extension.match(/(jpg|jpeg|png|gif)$/i)
        ) as TFile[];

        // Console logs for file finding - useful for initial setup, can be removed later
        console.log("OTD-Photo: Found files in folder:", folder.children);
        console.log("OTD-Photo: Filtered imageFiles:", imageFiles);


        if (imageFiles.length === 0) {
          el.createEl("p", { text: `📷 No images found in ${folderPath}` });
          return;
        }

        // Mobile rendering using LensLoop's approach
        if (Platform.isMobileApp) {
           await Promise.all(imageFiles.map(async (file) => {
            const container = el.createDiv();
            // Using MarkdownRenderer for better mobile embedding/handling
            await MarkdownRenderer.renderMarkdown(
              `![[${file.path}]]`, // Use file.path directly as it's the full path
              container,
              ctx.sourcePath,
              this
            );
          }));
        } else {
          // Desktop rendering using OTD Photo Gallery's approach
          const style = config.style || "horizontal";
          const columns = parseInt(config.columns || "4");

          const gallery = el.createDiv({ cls: `otd-gallery ${style}` });
          gallery.style.display = "grid";
          gallery.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
          gallery.style.gap = "10px";

          for (const file of imageFiles) {
            if (file instanceof TFile) {
              const link = gallery.createEl("a", {
                href: "#" // Or potentially link directly to the file? current approach opens in new pane
              });

              // Open the file in a new leaf when clicked
              link.onclick = (e) => {
                e.preventDefault();
                (this as Plugin).app.workspace.getLeaf(true).openFile(file); // Use getLeaf(true) to open in new pane
              };

              const img = link.createEl("img");
              img.src = (this as Plugin).app.vault.getResourcePath(file);
              img.alt = file.name || "Photo";
              img.style.width = "100%";
              img.style.borderRadius = "8px";
              img.setAttribute("loading", "lazy"); // Lazy loading for better performance
              img.onerror = () => {
                // Optional: Replace with your placeholder image path if needed
                // img.src = "path/to/placeholder-image.png";
                img.alt = "Image not available";
                console.error(`OTD-Photo: Failed to load image: ${file.path}`); // Console log on error
              };
            } else {
               // This case should ideally not happen with the filter above, but good practice
              console.warn(`OTD-Photo: Skipping non-TFile item found after filter (should not happen): ${file.name}`);
            }
          }
        }
      } else {
        // This case should ideally not happen if folder creation succeeded, but good practice
        el.createEl("p", { text: `📁 Folder object not found or is not a folder after check: ${folderPath}` });
        console.error(`OTD-Photo: Folder object not found or is not a folder after check: ${folderPath}`, folder); // Console log
      }
    });
  }

  onunload() {
    // Any cleanup goes here
  }
}