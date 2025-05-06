"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => OTDPhotoPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var OTDPhotoPlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("OTD-Photo", async (source, el, ctx) => {
      const lines = source.split(/\r?\n/);
      const config = {};
      for (const line of lines) {
        const [key, value] = line.split("=").map((s) => s.trim());
        if (key && value) config[key.toLowerCase()] = value.replace(/^"|"$/g, "");
      }
      const useFileName = config.usefilename === "true";
      const fallback = config.fallbacktotoday === "true";
      const base = config.basepath || "Journal_Photos";
      const today = window.moment().format("YYYY-MM-DD");
      let datePath = config.path;
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
      console.log("OTD-Photo: Calculated folderPath:", folderPath);
      let folder = this.app.vault.getAbstractFileByPath(folderPath);
      console.log("OTD-Photo: Folder object retrieved:", folder);
      if (!folder) {
        try {
          await this.app.vault.createFolder(folderPath);
          console.log("OTD-Photo: Folder created:", folderPath);
        } catch (err) {
          el.createEl("p", { text: `\u26A0\uFE0F Error creating folder: ${folderPath}` });
          console.error(`OTD-Photo: Error creating folder ${folderPath}:`, err);
          return;
        }
      }
      folder = this.app.vault.getAbstractFileByPath(folderPath);
      console.log("OTD-Photo: Folder object (after potential creation):", folder);
      if (folder instanceof import_obsidian.TFolder) {
        const imageFiles = folder.children.filter(
          (f) => f instanceof import_obsidian.TFile && f.extension.match(/(jpg|jpeg|png|gif)$/i)
        );
        console.log("OTD-Photo: Found files in folder:", folder.children);
        console.log("OTD-Photo: Filtered imageFiles:", imageFiles);
        if (imageFiles.length === 0) {
          el.createEl("p", { text: `\u{1F4F7} No images found in ${folderPath}` });
          return;
        }
        if (import_obsidian.Platform.isMobileApp) {
          await Promise.all(imageFiles.map(async (file) => {
            const container = el.createDiv();
            await import_obsidian.MarkdownRenderer.renderMarkdown(
              `![[${file.path}]]`,
              // Use file.path directly as it's the full path
              container,
              ctx.sourcePath,
              this
            );
          }));
        } else {
          const style = config.style || "horizontal";
          const columns = parseInt(config.columns || "4");
          const gallery = el.createDiv({ cls: `otd-gallery ${style}` });
          gallery.style.display = "grid";
          gallery.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
          gallery.style.gap = "10px";
          for (const file of imageFiles) {
            if (file instanceof import_obsidian.TFile) {
              const link = gallery.createEl("a", {
                href: "#"
                // Or potentially link directly to the file? current approach opens in new pane
              });
              link.onclick = (e) => {
                e.preventDefault();
                this.app.workspace.getLeaf(true).openFile(file);
              };
              const img = link.createEl("img");
              img.src = this.app.vault.getResourcePath(file);
              img.alt = file.name || "Photo";
              img.style.width = "100%";
              img.style.borderRadius = "8px";
              img.setAttribute("loading", "lazy");
              img.onerror = () => {
                img.alt = "Image not available";
                console.error(`OTD-Photo: Failed to load image: ${file.path}`);
              };
            } else {
              console.warn(`OTD-Photo: Skipping non-TFile item found after filter (should not happen): ${file.name}`);
            }
          }
        }
      } else {
        el.createEl("p", { text: `\u{1F4C1} Folder object not found or is not a folder after check: ${folderPath}` });
        console.error(`OTD-Photo: Folder object not found or is not a folder after check: ${folderPath}`, folder);
      }
    });
  }
  onunload() {
  }
};
