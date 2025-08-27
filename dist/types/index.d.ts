export declare class OdtTemplater {
    private contentXml;
    /**
     * Constructs an OdtTemplater instance.
     * @param contentXml The 'content.xml' file content as a string.
     */
    constructor(contentXml: string);
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
     * Renders the template by replacing placeholders and processing conditional blocks.
     * @param data The object containing the placeholder values.
     * @returns The final 'content.xml' as a string.
     */
    render(data: {
        [key: string]: any;
    }): string;
}
