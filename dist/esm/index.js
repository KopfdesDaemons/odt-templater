import PizZip from "pizzip";
import * as fs from "fs";
export class OdtTemplater {
    zip;
    contentXml;
    constructor(templatePath) {
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found at: ${templatePath}`);
        }
        const content = fs.readFileSync(templatePath, "binary");
        this.zip = new PizZip(content);
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
