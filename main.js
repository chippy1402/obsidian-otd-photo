"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
var obsidian_1 = require("obsidian");
var OTDPhotoPlugin = /** @class */ (function (_super) {
    __extends(OTDPhotoPlugin, _super);
    function OTDPhotoPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OTDPhotoPlugin.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.registerMarkdownCodeBlockProcessor("OTD-Photo", function (source, el, ctx) { return __awaiter(_this, void 0, void 0, function () {
                    var lines, config, _i, lines_1, line, _a, key, value, useFileName, fallback, base, today, datePath, folderPath_1, folder_1, children, _loop_1, this_1, _b, children_1, file, fileName, match, folderPath, style, columns, folder, err_1, imageFiles, gallery, _loop_2, this_2, _c, imageFiles_1, file;
                    var _this = this;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                lines = source.split(/\r?\n/);
                                config = {};
                                // Parse key=value pairs from the block
                                for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                    line = lines_1[_i];
                                    _a = line.split("=").map(function (s) { return s.trim(); }), key = _a[0], value = _a[1];
                                    if (key && value)
                                        config[key.toLowerCase()] = value.replace(/^"|"$/g, "");
                                }
                                useFileName = config.usefilename === "true";
                                fallback = config.fallbacktotoday === "true";
                                base = config.basepath || "Journal_Photos";
                                today = window.moment().format("YYYY-MM-DD");
                                datePath = config.path;
                                // Mobile-safe rendering: simple vertical list of images
                                if (/Mobi|Android/i.test(navigator.userAgent)) {
                                    folderPath_1 = base + '/' + (datePath || today);
                                    folder_1 = this.app.vault.getAbstractFileByPath(folderPath_1);
                                    if (folder_1 && folder_1 instanceof obsidian_1.TFolder) {
                                        children = folder_1.children.filter(function (f) { return f instanceof obsidian_1.TFile && f.extension.match(/jpg|jpeg|png|gif/i); });
                                        _loop_1 = function (file) {
                                            var img = el.createEl("img");
                                            if (file instanceof obsidian_1.TFile) {
                                                img.src = this_1.app.vault.getResourcePath(file);
                                            }
                                            else {
                                                console.warn("Skipping non-TFile item: ".concat(file.name));
                                            }
                                            img.alt = file.name || "Photo";
                                            img.style.width = "100%";
                                            img.style.borderRadius = "8px";
                                            img.style.marginBottom = "10px";
                                            img.setAttribute("loading", "lazy"); // Lazy loading for better performance
                                            img.onerror = function () {
                                                img.src = "path/to/placeholder-image.png"; // Replace with your placeholder image
                                                img.alt = "Image not available";
                                            };
                                        };
                                        this_1 = this;
                                        for (_b = 0, children_1 = children; _b < children_1.length; _b++) {
                                            file = children_1[_b];
                                            _loop_1(file);
                                        }
                                    }
                                    else {
                                        el.createEl("p", { text: "No folder found for path: ".concat(folderPath_1) });
                                    }
                                    return [2 /*return*/];
                                }
                                if (!datePath && useFileName) {
                                    fileName = ctx.sourcePath.split("/").pop() || "";
                                    match = fileName.match(/\d{4}-\d{2}-\d{2}/);
                                    datePath = (match === null || match === void 0 ? void 0 : match[0]) || "";
                                    console.log("OTD-Photo config:", config);
                                    console.log("ctx.sourcePath:", ctx.sourcePath);
                                    console.log("File name extracted:", fileName);
                                    console.log("Date match:", match === null || match === void 0 ? void 0 : match[0]);
                                    console.log("Final datePath:", datePath);
                                }
                                if (!datePath && fallback) {
                                    datePath = today;
                                    console.log("Falling back to today's date:", today);
                                }
                                folderPath = "".concat(base, "/").concat(datePath || today);
                                style = config.style || "horizontal";
                                columns = parseInt(config.columns || "4");
                                console.log("Final folder path:", folderPath);
                                folder = this.app.vault.getAbstractFileByPath(folderPath);
                                if (!!folder) return [3 /*break*/, 4];
                                _d.label = 1;
                            case 1:
                                _d.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, this.app.vault.createFolder(folderPath)];
                            case 2:
                                _d.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_1 = _d.sent();
                                el.createEl("p", { text: "\u26A0\uFE0F Error creating folder: ".concat(folderPath) });
                                return [2 /*return*/];
                            case 4:
                                // Refresh folder reference after creating
                                folder = this.app.vault.getAbstractFileByPath(folderPath);
                                if (folder instanceof obsidian_1.TFolder) {
                                    imageFiles = folder.children.filter(function (f) { return f.name.match(/\.(jpg|jpeg|png|gif)$/i); });
                                    if (imageFiles.length === 0) {
                                        el.createEl("p", { text: "\uD83D\uDCF7 No images found in ".concat(folderPath) });
                                        return [2 /*return*/];
                                    }
                                    gallery = el.createDiv({ cls: "otd-gallery ".concat(style) });
                                    gallery.style.display = "grid";
                                    gallery.style.gridTemplateColumns = "repeat(".concat(columns, ", 1fr)");
                                    gallery.style.gap = "10px";
                                    _loop_2 = function (file) {
                                        if (file instanceof obsidian_1.TFile) {
                                            var link = gallery.createEl("a", {
                                                href: "#"
                                            });
                                            link.onclick = function (e) {
                                                e.preventDefault();
                                                _this.app.workspace.getLeaf().openFile(file);
                                            };
                                            var img_1 = link.createEl("img");
                                            img_1.src = this_2.app.vault.getResourcePath(file);
                                            img_1.alt = file.name || "Photo";
                                            img_1.style.width = "100%";
                                            img_1.style.borderRadius = "8px";
                                            img_1.setAttribute("loading", "lazy"); // Lazy loading for better performance
                                            img_1.onerror = function () {
                                                img_1.src = "path/to/placeholder-image.png"; // Replace with your placeholder image
                                                img_1.alt = "Image not available";
                                            };
                                        }
                                        else {
                                            console.warn("Skipping non-file item: ".concat(file.name));
                                        }
                                    };
                                    this_2 = this;
                                    for (_c = 0, imageFiles_1 = imageFiles; _c < imageFiles_1.length; _c++) {
                                        file = imageFiles_1[_c];
                                        _loop_2(file);
                                    }
                                }
                                else {
                                    el.createEl("p", { text: "\uD83D\uDCC1 Folder not found: ".concat(folderPath) });
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    OTDPhotoPlugin.prototype.onunload = function () { };
    return OTDPhotoPlugin;
}(obsidian_1.Plugin));
exports.default = OTDPhotoPlugin;
