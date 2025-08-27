export declare class OdtTemplater {
    private zip;
    private contentXml;
    constructor(templatePath: string);
    /**
     * Retrieves the value from a nested object based on a dot-separated path.
     * E.g., for path 'user.name', it retrieves data['user']['name'].
     * @param data The object to retrieve the value from.
     * @param path The dot-separated path string.
     * @returns The value at the specified path or undefined if not found.
     */
    private _getValueFromPath;
    /**
     * Removes Tags from within placeholders in the template.
     * E.g., {<text:span>key</text:span>} becomes {key}
     */
    private _removeTagsFromTemplate;
    /**
     * Processes conditionals in the ODT content.
     * E.g., {#key == value}...{/} will include the content if key equals value.
     * @param data The object containing the placeholder values.
     */
    private _processConditionals;
    /**
     * Processes empty conditionals in the ODT content.
     * E.g., {#key }...{/} will include the content if key is non-empty.
     * @param data The object containing the placeholder values.
     */
    private _processEmptyConditionals;
    /**
     * Replaces placeholders in the ODT content with their corresponding values.
     * E.g., {user.name} will be replaced with the value of data.user.name.
     * @param data The object containing the placeholder values.
     */
    private _replacePlaceholders;
    /**
     * Replaces placeholders and processes conditional blocks in the ODT content.
     * @param data The object containing the placeholder values.
     */
    replaceVariables(data: {
        [key: string]: any;
    }): void;
    /**
     * Generates a new ODT file with the updated content.
     * @param outputPath The path where the new file should be saved.
     */
    generate(outputPath: string): void;
}
