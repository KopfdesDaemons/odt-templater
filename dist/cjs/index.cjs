"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdtTemplater = void 0;
class OdtTemplater {
    contentXml;
    /**
     * Constructs an OdtTemplater instance.
     * @param contentXml The 'content.xml' file content as a string.
     */
    constructor(contentXml) {
        this.contentXml = contentXml;
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
     * Processes inline conditionals in the ODT content.
     * E.g., {#key == value}...{/} will include the content if key equals value.
     * @param data The object containing the placeholder values.
     */
    _processInlineConditionals(data) {
        const conditionRegex = /\{\s*#([^\\{}]+?)\s*==\s*([^\\{}]+?)\s*\}((?:(?!text:p)[\s\S])*?)\{\/\}/gs;
        this.contentXml = this.contentXml.replace(conditionRegex, (_match, key, value, content) => {
            const actualValue = this._getValueFromPath(data, key);
            return actualValue?.toString() === value ? content : "";
        });
    }
    /**
     * Processes inline empty conditionals in the ODT content.
     * E.g., {#key }...{/} will include the content if key is non-empty.
     * @param data The object containing the placeholder values.
     */
    _processEmptyInlineConditionals(data) {
        const emptyConditionRegex = /\{\s*#([^\\{}]+?)\s*\}((?:(?!text:p)[\s\S])*?)\{\/\}/gs;
        this.contentXml = this.contentXml.replace(emptyConditionRegex, (_match, key, content) => {
            const actualValue = this._getValueFromPath(data, key);
            return actualValue !== null && actualValue !== undefined && actualValue !== "" && actualValue !== false ? content : "";
        });
    }
    /**
     * Processes block conditionals in the ODT content.
     * E.g.,
     *   {#key == value}
     *    ...
     *   {/}
     * will include the content if key equals value.
     * @param data The object containing the placeholder values.
     */
    _processBlockConditionals(data) {
        const blockConditionRegex = /<text:p(?:(?!<text:p)[\s\S])*?\{\s*#([^\\{}]+?)\s*==\s*([^\\{}]+?)\s*\}\s*<.*?\/text:p>([\s\S]*?)<text:p(?:(?!<text:p)[\s\S])*?\{\/\}.*?<\/text:p>/gs;
        this.contentXml = this.contentXml.replace(blockConditionRegex, (_match, key, value, content) => {
            const actualValue = this._getValueFromPath(data, key);
            return actualValue?.toString() === value ? content : "";
        });
    }
    /**
     * Processes empty block conditionals in the ODT content.
     * E.g.:
     *   {#key }
     *    ...
     *   {/}
     * will include the content if key is non-empty.
     * @param data The object containing the placeholder values.
     */
    _processEmptyBlockConditionals(data) {
        const emptyConditionRegex = /<text:p(?:(?!<text:p)[\s\S])*?\{\s*#([^\\{}]+?)\s*\}\s*<.*?\/text:p>([\s\S]*?)<text:p(?:(?!<text:p)[\s\S])*?\{\/\}.*?<\/text:p>/gs;
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
     * Renders the template by replacing placeholders and processing conditional blocks.
     * @param data The object containing the placeholder values.
     * @returns The final 'content.xml' as a string.
     */
    render(data) {
        this._removeTagsFromTemplate();
        this._processInlineConditionals(data);
        this._processBlockConditionals(data);
        this._processEmptyInlineConditionals(data);
        this._processEmptyBlockConditionals(data);
        this._replacePlaceholders(data);
        return this.contentXml;
    }
}
exports.OdtTemplater = OdtTemplater;
