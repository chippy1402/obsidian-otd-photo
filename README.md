# OTD Photo Gallery Plugin for Obsidian

Automatically generate a photo gallery inside your daily notes using a simple code block.

This plugin scans a dated photo folder and builds an image grid based on the date of the note—perfect for journaling, "on this day" reflections, and visual life-logging.

---

## 📦 How to Use

Insert this code block into your note:

````markdown
```OTD-Photo
usefilename=true
fallbacktotoday=true
columns=3
style=horizontal
```
````

> 📝 **Make sure your note is named like `YYYY-MM-DD.md`** for best results.

The plugin will automatically:
- Extract the date from the filename
- Look inside `Journal_Photos/YYYY-MM-DD/`
- Display a grid of image thumbnails
- Open images in Obsidian when clicked
- Create the folder if it doesn’t already exist

---

## ⚙️ Options

| Option           | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `usefilename`     | Set to `true` to extract the date from the note's filename (`YYYY-MM-DD`) |
| `fallbacktotoday` | Set to `true` to use today's date if filename parsing fails                |
| `basepath`        | Set a custom root folder (default is `Journal_Photos`)                     |
| `columns`         | Number of columns in the gallery layout (default: `4`)                     |
| `style`           | Gallery style (currently `horizontal`, others are visual only)             |

---

## 🖼 Example

If your note is `2025-04-29.md`, and you have images in:
```
Journal_Photos/2025-04-29/
```
They will be rendered in a clean, clickable grid.

---

## 🔧 Bonus Ideas

- Use Hazel or Lightroom to export photos into `Journal_Photos/YYYY-MM-DD` automatically
- Combine with Templater to insert the block dynamically (not required)
- Use it for habit tracking, visual memory, travel journals, etc.
- Things to do,
- Add more Gallery Options

---

## 🛠 Development Notes

This plugin was created by [chippy1402](https://github.com/chippy1402). Contributions welcome!

MIT Licensed.
