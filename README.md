# Odt-templater

A simple templating engine for OpenDocument Text (.odt) files.

- Replaces placeholders in the ODT content with their corresponding values.

  E.g., `{user.name}` will be replaced with the value of data.user.name.

- Supports conditionals in the ODT content.

  E.g., `{#key == value}...{/}` will include the content if key equals value.

- Supports empty conditionals in the ODT content.

  E.g., `{#key}...{/}` will include the content if key is non-empty and not false.

## Getting Started

Minimal examples for using the odt-templater in Node.js and in the browser.

There is a [Github repository](https://github.com/KopfdesDaemons/odt-templater-examples) with the following examples.

### Usage in Node.js

```js
const { OdtTemplater } = require("odt-templater");
const fs = require("fs");
const PizZip = require("pizzip");

const data = {
  title: "Hello World",
  description: "A wonderful text",
  user: {
    first_name: "John",
    last_name: "Doe",
    city: "New York",
    age: 30,
    email: "john.doe@example.com",
    website: "https://example.com",
  },
};

// 1. Load the ODT template file
const templateBuffer = fs.readFileSync("./template.odt");
const zip = new PizZip(templateBuffer);
const content = zip.file("content.xml").asText();

// 2. Initialize OdtTemplater and render the document
const templater = new OdtTemplater(content);
const renderedContent = templater.render(data);

// 3. Replace the content in the ZIP
zip.file("content.xml", renderedContent);

// 4. Generate the output ODT file
const outputBuffer = zip.generate({ type: "nodebuffer" });
fs.writeFileSync("./output.odt", outputBuffer);
```

### Usage in the browser

```js
async function generateOdtDocument() {
  const data = {
    title: "Hello World",
    description: "A wonderful text",
    user: {
      first_name: "John",
      last_name: "Doe",
      city: "New York",
      age: 30,
      email: "john.doe@example.com",
      website: "https://example.com",
    },
  };

  // 1. Load the ODT template file
  const response = await fetch("template.odt");
  const templateArrayBuffer = await response.arrayBuffer();

  // 2. Get the 'content.xml' from the ODT file
  const jszip = new JSZip();
  const zip = await jszip.loadAsync(templateArrayBuffer);
  const content = await zip.file("content.xml").async("string");

  // 3. Initialize OdtTemplater and render the document
  const templater = new OdtTemplater(content);
  const renderedContent = templater.render(data);

  // 4. Replace the content in the ZIP
  zip.file("content.xml", renderedContent);

  // 5. Generate the output ODT file as a Blob
  const outputBlob = await zip.generateAsync({ type: "blob" });

  // 6. Create a download link and trigger the download
  const url = URL.createObjectURL(outputBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.odt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById("generateBtn").addEventListener("click", generateOdtDocument);
```

## Template Syntax

### Placeholders

Placeholders are defined with curly braces. The following syntax is supported.

- {key} - Replaces with the value of `data[key]`
- {key.key} - Replaces with the value of `data[key][key]`
- { key } - Replaces with the value of `data[key]`
- { key.key } - Replaces with the value of `data[key][key]`

Example:

![placeholder-example](/src/img/placeholders-example.png)

Result:

![placeholder-example-rendered](/src/img/placeholders-example-rendered.png)

### Conditionals

Conditions are defined with curly braces, a hash mark, the key being checked, a double equal sign, and the value being compared.

Example:

- {#key == value} ... {/}
- {#key.key == value} ... {/}
- { #key == value } ... {/}
- { #key.key == value } ... {/}

There is support for inline conditionals and block conditionals.

Example:

![conditional-example](/src/img/conditionals-example.png)

### Empty Conditionals

Empty conditionals are defined with curly braces, a hash mark, and a key.

- {#key} ... {/}
- {#key.key} ... {/}
- { #key} ... {/}
- { #key.key } ... {/}

False values ​​and empty strings are considered empty.

Example:

![conditional-example](/src/img/empty-conditionals-example.png)
