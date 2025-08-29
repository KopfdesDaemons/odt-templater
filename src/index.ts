export class OdtTemplater {
  private contentXml: string;

  /**
   * Constructs an OdtTemplater instance.
   * @param contentXml The 'content.xml' file content as a string.
   */
  constructor(contentXml: string) {
    this.contentXml = contentXml;
  }

  /**
   * Retrieves the value from a nested object based on a dot-separated path.
   * E.g., for path 'user.name', it retrieves data['user']['name'].
   * @param data The object to retrieve the value from.
   * @param path The dot-separated path string.
   * @returns The value at the specified path or undefined if not found.
   */
  private _getValueFromPath(data: any, path: string): string | undefined | boolean {
    const keys = path.split(".");
    let value = data;

    for (const key of keys) {
      if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, key)) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value as string | undefined | boolean;
  }

  /**
   * Removes Tags from within placeholders in the template.
   * E.g., {<text:span>key</text:span>} becomes {key}
   */
  private _removeTagsFromTemplate(): void {
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
  private _processInlineConditionals(data: { [key: string]: any }): void {
    const conditionRegex = /\{\s*#([^\\{}]+?)\s*==\s*(.*?)\s*\}((?:(?!text:p)[\s\S])*?)\{\/\}/gs;
    this.contentXml = this.contentXml.replace(conditionRegex, (_match, key: string, value: string, content: string): string => {
      const actualValue = this._getValueFromPath(data, key);
      return actualValue?.toString() === value ? content : "";
    });
  }

  /**
   * Processes inline empty conditionals in the ODT content.
   * E.g., {#key }...{/} will include the content if key is non-empty.
   * @param data The object containing the placeholder values.
   */
  private _processEmptyInlineConditionals(data: { [key: string]: any }): void {
    const emptyConditionRegex = /\{\s*#([^\\{}]+?)\s*\}((?:(?!text:p)[\s\S])*?)\{\/\}/gs;
    this.contentXml = this.contentXml.replace(emptyConditionRegex, (_match, key: string, content: string): string => {
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
  private _processBlockConditionals(data: { [key: string]: any }): void {
    const blockConditionRegex =
      /<text:p(?:(?!<text:p)[\s\S])*?\{\s*#(.*?)\s*==\s*(.*?)\s*\}<.*?\/text:p>(<text:p[\s\S]*?)<text:p(?:(?!<text:p)[\s\S])*?\{\/\}.*?<\/text:p>/gs;
    this.contentXml = this.contentXml.replace(blockConditionRegex, (_match, key: string, value: string, content: string): string => {
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
  private _processEmptyBlockConditionals(data: { [key: string]: any }): void {
    const emptyConditionRegex =
      /<text:p(?:(?!<text:p)[\s\S])*?\{\s*#(.*?)\s*\}<.*?\/text:p>(<text:p[\s\S]*?)<text:p(?:(?!<text:p)[\s\S])*?\{\/\}.*?<\/text:p>/gs;
    this.contentXml = this.contentXml.replace(emptyConditionRegex, (_match, key: string, content: string): string => {
      const actualValue = this._getValueFromPath(data, key);
      return actualValue !== null && actualValue !== undefined && actualValue !== "" && actualValue !== false ? content : "";
    });
  }

  /**
   * Replaces placeholders in the ODT content with their corresponding values.
   * E.g., {user.name} will be replaced with the value of data.user.name.
   * @param data The object containing the placeholder values.
   */
  private _replacePlaceholders(data: { [key: string]: any }): void {
    const variableRegex = /\{([^#/]*?)\}/g;
    this.contentXml = this.contentXml.replace(variableRegex, (_match: string, path: string): string => {
      const value = this._getValueFromPath(data, path.trim());
      return value !== null && value !== undefined ? String(value) : "";
    });
  }

  /**
   * Renders the template by replacing placeholders and processing conditional blocks.
   * @param data The object containing the placeholder values.
   * @returns The final 'content.xml' as a string.
   */
  public render(data: { [key: string]: any }): string {
    this._removeTagsFromTemplate();
    this._processInlineConditionals(data);
    this._processBlockConditionals(data);
    this._processEmptyInlineConditionals(data);
    this._processEmptyBlockConditionals(data);
    this._replacePlaceholders(data);
    return this.contentXml;
  }
}
