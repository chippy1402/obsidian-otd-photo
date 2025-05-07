// src/main.ts
import { Plugin, TFolder, TFile, Platform, MarkdownRenderer, MarkdownPostProcessorContext } from "obsidian";

export default class OTDPhotoPlugin extends Plugin {
  async onload() {
    // Register the markdown code block processor for OTD-Photo
    this.registerMarkdownCodeBlockProcessor("OTD-Photo", this.processCodeBlock.bind(this));
    console.log("OTD Photo Gallery plugin loaded."); // Added a load log
  }

  onunload() {
    console.log("OTD Photo Gallery plugin unloaded."); // Added an unload log
  }

  /**
   * Main processor for the OTD-Photo code block.
   * Orchestrates the steps: parsing config, getting files, and rendering.
   */
  private async processCodeBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    try {
      // 1. Parse configuration from the source string
      const config = this.parseConfig(source);
      console.log("OTD-Photo: Parsed config:", config); // Keep log for now

      // 2. Determine the folder path based on config, filename, and fallback
      const folderPath = this.determineFolderPath(config, ctx);
      console.log("OTD-Photo: Calculated folderPath:", folderPath); // Keep log for now

      // 3. Ensure the folder exists and get the folder object
      const folder = await this.ensureFolderExists(folderPath, el);
      if (!folder) {
        // Error message already handled in ensureFolderExists
        return;
      }
      console.log("OTD-Photo: Folder object retrieved/created:", folder); // Keep log for now


      // 4. Get the image files within the folder
      const imageFiles = this.getImagesInFolder(folder);
      console.log("OTD-Photo: Filtered imageFiles:", imageFiles); // Keep log for now


      if (imageFiles.length === 0) {
        el.createEl("p", { text: `📷 No images found in ${folderPath}` });
        console.log(`OTD-Photo: No images found in ${folderPath}`); // Keep log for now
        return;
      }

      // 5. Render the gallery based on platform
      if (Platform.isMobileApp) {
        await this.renderMobileGallery(el, imageFiles, ctx);
      } else {
        this.renderDesktopGallery(el, imageFiles, config);
      }

    } catch (error) {
      console.error("OTD-Photo: An unexpected error occurred:", error);
      el.createEl("p", { text: `⚠️ An unexpected error occurred while rendering gallery.` });
    }
  }

  /**
   * Parses key=value configuration from the source string.
   */
  private parseConfig(source: string): Record<string, string> {
    const config: Record<string, string> = {};
    const lines = source.split(/\r?\n/);
    for (const line of lines) {
      const [key, value] = line.split("=").map(s => s.trim());
      if (key && value) {
        config[key.toLowerCase()] = value.replace(/^"|"$/g, "");
      }
    }
    return config;
  }

  /**
   * Determines the final folder path based on configuration and context.
   */
  private determineFolderPath(config: Record<string, string>, ctx: MarkdownPostProcessorContext): string {
    const useFileName = config.usefilename === "true";
    const fallback = config.fallbacktotoday === "true";
    const base = config.basepath || "Journal_Photos";
    const today = window.moment().format("YYYY-MM-DD");

    let datePath = config.path;

    if (!datePath && useFileName) {
      const fileName = ctx.sourcePath.split("/").pop() || "";
      const match = fileName.match(/\d{4}-\d{2}-\d{2}/);
      datePath = match?.[0] || "";

      console.log("OTD-Photo date determination - ctx.sourcePath:", ctx.sourcePath); // Keep log for now
      console.log("OTD-Photo date determination - File name extracted:", fileName); // Keep log for now
      console.log("OTD-Photo date determination - Date match:", match?.[0]); // Keep log for now
    }

    if (!datePath && fallback) {
      datePath = today;
      console.log("OTD-Photo date determination - Falling back to today's date:", today); // Keep log for now
    }

    // Use today's date as a final fallback if no datePath is determined
    return `${base}/${datePath || today}`;
  }

  /**
   * Checks if a folder exists and creates it if it doesn't.
   * Returns the TFolder object or null if creation fails.
   */
  private async ensureFolderExists(folderPath: string, el: HTMLElement): Promise<TFolder | null> {
    let folder = this.app.vault.getAbstractFileByPath(folderPath);
     console.log("OTD-Photo ensureFolderExists - Folder object retrieved:", folder); // Keep log for now


    if (!folder) {
      try {
        await this.app.vault.createFolder(folderPath);
         console.log("OTD-Photo ensureFolderExists - Folder created:", folderPath); // Keep log for now
        // Refresh folder reference after creating
        folder = this.app.vault.getAbstractFileByPath(folderPath);
         console.log("OTD-Photo ensureFolderExists - Folder object after creation:", folder); // Keep log for now
      } catch (err) {
        el.createEl("p", { text: `⚠️ Error creating folder: ${folderPath}` });
        console.error(`OTD-Photo ensureFolderExists - Error creating folder ${folderPath}:`, err); // Keep log for now
        return null;
      }
    }

    if (!(folder instanceof TFolder)) {
        el.createEl("p", { text: `📁 Path exists but is not a folder: ${folderPath}` });
        console.error(`OTD-Photo ensureFolderExists - Path exists but is not a folder: ${folderPath}`, folder); // Keep log for now
        return null;
    }

    return folder as TFolder; // Cast is safe here after instanceof check
  }

  /**
   * Filters TFile objects in a folder's children to find image files.
   */
  private getImagesInFolder(folder: TFolder): TFile[] {
    // CORRECTED REGEX: Matches common image extensions case-insensitively
    const imageExtensions = /(jpg|jpeg|png|gif|bmp|svg)$/i;
    return folder.children.filter(f =>
      f instanceof TFile && (f as TFile).extension.match(imageExtensions)
    ) as TFile[];
  }

  /**
   * Renders the image gallery specifically for mobile platforms.
   * Uses MarkdownRenderer for embedding.
   */
  private async renderMobileGallery(el: HTMLElement, files: TFile[], ctx: MarkdownPostProcessorContext) {
    console.log("OTD-Photo rendering - Mobile rendering initiated."); // Keep log for now
    await Promise.all(files.map(async (file) => {
      const container = el.createDiv();
      // Using MarkdownRenderer for better mobile embedding/handling
      await MarkdownRenderer.renderMarkdown(
        `![[${file.path}]]`, // Use file.path directly as it's the full path
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
  private renderDesktopGallery(el: HTMLElement, files: TFile[], config: Record<string, string>) {
     console.log("OTD-Photo rendering - Desktop rendering initiated."); // Keep log for now
    const style = config.style || "horizontal"; // Note: 'horizontal' style is less relevant for grid, maybe rename config option?
    const columns = parseInt(config.columns || "4");
    const gap = config.gap || "10px"; // Added option for gap

    const gallery = el.createDiv({ cls: `otd-gallery ${style}` });
    gallery.style.display = "grid";
    // Ensure columns is a valid number, default to 4 if not
    gallery.style.gridTemplateColumns = `repeat(${isNaN(columns) ? 4 : columns}, 1fr)`;
    gallery.style.gap = gap; // Use gap from config


    for (const file of files) {
      // Added an extra check, though getImagesInFolder should ensure TFile
      if (file instanceof TFile) {
        const link = gallery.createEl("a", {
          href: "#" // Link will be handled by the onclick
        });

        // Open the file in a new leaf when clicked
        link.onclick = (e) => {
          e.preventDefault();
          // Use getLeaf(true) to open in new pane, handle potential null
          this.app.workspace.getLeaf(true)?.openFile(file).catch(err => {
               console.error(`OTD-Photo rendering - Failed to open file ${file.path}:`, err); // Keep log for now
               // Optional: User feedback in the UI if opening fails
           });
        };

        const img = link.createEl("img");
        img.src = this.app.vault.getResourcePath(file);
        img.alt = file.basename || "Photo"; // Use basename for alt text, often more readable
        img.style.width = "100%";
        img.style.height = "auto"; // Added auto height for aspect ratio
        img.style.objectFit = "cover"; // Added object-fit for consistent sizing within grid cells
        img.style.borderRadius = "8px";
        img.setAttribute("loading", "lazy"); // Lazy loading for better performance
        img.onerror = () => {
          // Optional: Replace with your placeholder image path if needed
          // img.src = this.app.vault.getResourcePath("path/to/placeholder-image.png");
          img.alt = `Image not available: ${file.name}`; // More informative alt text on error
          console.error(`OTD-Photo rendering - Failed to load image source for: ${file.path}`); // Keep log for now
        };
      } else {
         // This case should ideally not happen but good practice
         console.warn(`OTD-Photo rendering - Skipping non-TFile item found after filter: ${file}`); // Keep log for now
      }
    }
  }
}