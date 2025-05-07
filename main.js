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
    this.registerMarkdownCodeBlockProcessor("OTD-Photo", this.processCodeBlock.bind(this));
    console.log("OTD Photo Gallery plugin loaded.");
  }
  onunload() {
    console.log("OTD Photo Gallery plugin unloaded.");
  }
  /**
   * Main processor for the OTD-Photo code block.
   * Orchestrates the steps: parsing config, getting files, and rendering.
   */
  async processCodeBlock(source, el, ctx) {
    try {
      const config = this.parseConfig(source);
      console.log("OTD-Photo: Parsed config:", config);
      const folderPath = this.determineFolderPath(config, ctx);
      console.log("OTD-Photo: Calculated folderPath:", folderPath);
      const folder = await this.ensureFolderExists(folderPath, el);
      if (!folder) {
        return;
      }
      console.log("OTD-Photo: Folder object retrieved/created:", folder);
      const imageFiles = this.getImagesInFolder(folder);
      console.log("OTD-Photo: Filtered imageFiles:", imageFiles);
      if (imageFiles.length === 0) {
        el.createEl("p", { text: `\u{1F4F7} No images found in ${folderPath}` });
        console.log(`OTD-Photo: No images found in ${folderPath}`);
        return;
      }
      if (import_obsidian.Platform.isMobileApp) {
        await this.renderMobileGallery(el, imageFiles, ctx);
      } else {
        this.renderDesktopGallery(el, imageFiles, config);
      }
    } catch (error) {
      console.error("OTD-Photo: An unexpected error occurred:", error);
      el.createEl("p", { text: `\u26A0\uFE0F An unexpected error occurred while rendering gallery.` });
    }
  }
  /**
   * Parses key=value configuration from the source string.
   */
  parseConfig(source) {
    const config = {};
    const lines = source.split(/\r?\n/);
    for (const line of lines) {
      const [key, value] = line.split("=").map((s) => s.trim());
      if (key && value) {
        config[key.toLowerCase()] = value.replace(/^"|"$/g, "");
      }
    }
    return config;
  }
  /**
   * Determines the final folder path based on configuration and context.
   */
  determineFolderPath(config, ctx) {
    const useFileName = config.usefilename === "true";
    const fallback = config.fallbacktotoday === "true";
    const base = config.basepath || "Journal_Photos";
    const today = window.moment().format("YYYY-MM-DD");
    let datePath = config.path;
    if (!datePath && useFileName) {
      const fileName = ctx.sourcePath.split("/").pop() || "";
      const match = fileName.match(/\d{4}-\d{2}-\d{2}/);
      datePath = match?.[0] || "";
      console.log("OTD-Photo date determination - ctx.sourcePath:", ctx.sourcePath);
      console.log("OTD-Photo date determination - File name extracted:", fileName);
      console.log("OTD-Photo date determination - Date match:", match?.[0]);
    }
    if (!datePath && fallback) {
      datePath = today;
      console.log("OTD-Photo date determination - Falling back to today's date:", today);
    }
    return `${base}/${datePath || today}`;
  }
  /**
   * Checks if a folder exists and creates it if it doesn't.
   * Returns the TFolder object or null if creation fails.
   */
  async ensureFolderExists(folderPath, el) {
    let folder = this.app.vault.getAbstractFileByPath(folderPath);
    console.log("OTD-Photo ensureFolderExists - Folder object retrieved:", folder);
    if (!folder) {
      try {
        await this.app.vault.createFolder(folderPath);
        console.log("OTD-Photo ensureFolderExists - Folder created:", folderPath);
        folder = this.app.vault.getAbstractFileByPath(folderPath);
        console.log("OTD-Photo ensureFolderExists - Folder object after creation:", folder);
      } catch (err) {
        el.createEl("p", { text: `\u26A0\uFE0F Error creating folder: ${folderPath}` });
        console.error(`OTD-Photo ensureFolderExists - Error creating folder ${folderPath}:`, err);
        return null;
      }
    }
    if (!(folder instanceof import_obsidian.TFolder)) {
      el.createEl("p", { text: `\u{1F4C1} Path exists but is not a folder: ${folderPath}` });
      console.error(`OTD-Photo ensureFolderExists - Path exists but is not a folder: ${folderPath}`, folder);
      return null;
    }
    return folder;
  }
  /**
   * Filters TFile objects in a folder's children to find image files.
   */
  getImagesInFolder(folder) {
    const imageExtensions = /(jpg|jpeg|png|gif|bmp|svg)$/i;
    return folder.children.filter(
      (f) => f instanceof import_obsidian.TFile && f.extension.match(imageExtensions)
    );
  }
  /**
   * Renders the image gallery specifically for mobile platforms.
   * Uses MarkdownRenderer for embedding.
   */
  async renderMobileGallery(el, files, ctx) {
    console.log("OTD-Photo rendering - Mobile rendering initiated.");
    await Promise.all(files.map(async (file) => {
      const container = el.createDiv();
      await import_obsidian.MarkdownRenderer.renderMarkdown(
        `![[${file.path}]]`,
        // Use file.path directly as it's the full path
        container,
        ctx.sourcePath,
        this
      );
    }));
  }
  /**
   * Renders the image gallery specifically for desktop platforms.
   * Creates a grid layout.
   */
  renderDesktopGallery(el, files, config) {
    console.log("OTD-Photo rendering - Desktop rendering initiated.");
    const style = config.style || "horizontal";
    const columns = parseInt(config.columns || "4");
    const gap = config.gap || "10px";
    const gallery = el.createDiv({ cls: `otd-gallery ${style}` });
    gallery.style.display = "grid";
    gallery.style.gridTemplateColumns = `repeat(${isNaN(columns) ? 4 : columns}, 1fr)`;
    gallery.style.gap = gap;
    for (const file of files) {
      if (file instanceof import_obsidian.TFile) {
        const link = gallery.createEl("a", {
          href: "#"
          // Link will be handled by the onclick
        });
        link.onclick = (e) => {
          e.preventDefault();
          this.app.workspace.getLeaf(true)?.openFile(file).catch((err) => {
            console.error(`OTD-Photo rendering - Failed to open file ${file.path}:`, err);
          });
        };
        const img = link.createEl("img");
        img.src = this.app.vault.getResourcePath(file);
        img.alt = file.basename || "Photo";
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.setAttribute("loading", "lazy");
        img.onerror = () => {
          img.alt = `Image not available: ${file.name}`;
          console.error(`OTD-Photo rendering - Failed to load image source for: ${file.path}`);
        };
      } else {
        console.warn(`OTD-Photo rendering - Skipping non-TFile item found after filter: ${file}`);
      }
    }
  }
};
