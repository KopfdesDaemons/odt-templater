"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdtTemplater = void 0;
const pizzip_1 = __importDefault(require("pizzip"));
const fs = __importStar(require("fs"));
class OdtTemplater {
    zip;
    contentXml;
    constructor(templatePath) {
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found at: ${templatePath}`);
        }
        const content = fs.readFileSync(templatePath, "binary");
        this.zip = new pizzip_1.default(content);
        const file = this.zip.files["content.xml"];
        if (!file) {
            throw new Error("content.xml not found in the ODT file.");
        }
        this.contentXml = file.asText();
    }
    /**
     * Retrieves the value from a nested object based on a dot-separated path.
     * E.g., for path 'user.name', it retrieves data['user']['name'].
     * @param data The object to retrieve the value from.
     * @param path The dot-separated path string.
     * @returns The value at the specified path or undefined if not found.
     */
    _getValueFromPath(data, path) {
        const keys = path.split(".");
        let value = data;
        for (const key of keys) {
            if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, key)) {
                value = value[key];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    /**
     * Removes Tags from within placeholders in the template.
     * E.g., {<text:span>key</text:span>} becomes {key}
     */
    _removeTagsFromTemplate() {
        const variableWithTagsRegex = /\{([^}]*)\}/g;
        this.contentXml = this.contentXml.replace(variableWithTagsRegex, (_match, innerContent) => {
            const cleanedContent = innerContent.replace(/<[^>]+>/g, "");
            return `{${cleanedContent}}`;
        });
    }
    /**
     * Processes conditionals in the ODT content.
     * E.g., {#key == value}...{/} will include the content if key equals value.
     * @param data The object containing the placeholder values.
     */
    _processConditionals(data) {
        const conditionRegex = /\{#\s*([^\\{}]+?)\s*==\s*(.*?)\}(.*?)\{\/\}/gs;
        this.contentXml = this.contentXml.replace(conditionRegex, (_match, key, value, content) => {
            const actualValue = this._getValueFromPath(data, key);
            return actualValue?.toString() === value ? content : "";
        });
    }
    /**
     * Processes empty conditionals in the ODT content.
     * E.g., {#key }...{/} will include the content if key is non-empty.
     * @param data The object containing the placeholder values.
     */
    _processEmptyConditionals(data) {
        const emptyConditionRegex = /<text:p(?:(?!<text:p)[\s\S])*?\{#\s*(.*?)\s*\}<.*?\/text:p>(<text:p[\s\S]*?)<text:p(?:(?!<text:p)[\s\S])*?\{\/\}.*?<\/text:p>/gs;
        this.contentXml = this.contentXml.replace(emptyConditionRegex, (_match, key, content) => {
            const actualValue = this._getValueFromPath(data, key);
            return actualValue !== null && actualValue !== undefined && actualValue !== "" && actualValue !== false ? content : "";
        });
    }
    /**
     * Replaces placeholders in the ODT content with their corresponding values.
     * E.g., {user.name} will be replaced with the value of data.user.name.
     * @param data The object containing the placeholder values.
     */
    _replacePlaceholders(data) {
        const variableRegex = /\{([^#/]*?)\}/g;
        this.contentXml = this.contentXml.replace(variableRegex, (_match, path) => {
            const value = this._getValueFromPath(data, path.trim());
            return value !== null && value !== undefined ? String(value) : "";
        });
    }
    /**
     * Replaces placeholders and processes conditional blocks in the ODT content.
     * @param data The object containing the placeholder values.
     */
    replaceVariables(data) {
        this._removeTagsFromTemplate();
        this._processConditionals(data);
        this._processEmptyConditionals(data);
        this._replacePlaceholders(data);
    }
    /**
     * Generates a new ODT file with the updated content.
     * @param outputPath The path where the new file should be saved.
     */
    generate(outputPath) {
        this.zip.file("content.xml", this.contentXml);
        const newZipContent = this.zip.generate({ type: "nodebuffer" });
        fs.writeFileSync(outputPath, newZipContent);
    }
}
exports.OdtTemplater = OdtTemplater;
