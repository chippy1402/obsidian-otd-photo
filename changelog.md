### Changelog

**Version [Suggested Version, e.g., 1.2.0]**

* **Added Mobile Compatibility:** The plugin now fully supports mobile devices (using `Platform.isMobileApp`) providing a dedicated rendering method optimized for smaller screens. This integrates functionality previously available in the separate LensLoop plugin.
* **Improved Mobile Rendering:** Photos on mobile are now rendered using Obsidian's standard Markdown embed syntax (`![[image path]]`) via `MarkdownRenderer`, ensuring better compatibility and handling on mobile platforms.
* **Fixed Image Filtering Issue:** Corrected a bug where image files were not being detected in folders due to an incorrect regular expression used when checking file extensions (`.jpg`, `.jpeg`, `.png`, `.gif`). Photos should now display correctly.
* **Consistent Path Handling:** Ensured that the logic for determining the photo folder path (using `basepath`, `path`, `usefilename`, and `fallbacktotoday` settings) works identically on both desktop and mobile.
* **Enhanced Desktop Experience:** Clicking an image in the desktop gallery now opens the image file in a new pane (`getLeaf(true)`), providing a smoother workflow.

---
