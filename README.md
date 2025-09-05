# Odt-templater

A simple templating engine for OpenDocument Text (.odt) files that can be used in Node.js and in the browser.

🚀 Super lightweight: 2KB (zipped 659 bytes)

## Features

- Placeholder replacement
- Conditionals
- Empty conditionals

## Getting Started

```bash
npm i odt-templater
```

The odt templater requires the content of the ODT file as a string as a parameter. The content must be read from the `content.xml` file within the ODT file. Any ZIP library, such as [JSZip](https://www.npmjs.com/package/jszip) or [PizZip](https://www.npmjs.com/package/pizzip?activeTab=code), can be used for this task.

There is a [GitHub repository](https://github.com/KopfdesDaemons/odt-templater-examples) with the following examples.

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
const contentFile = zip.file("content.xml");
if (!contentFile) throw new Error("content.xml not found in the ODT file.");
const content = contentFile.asText();

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
import { OdtTemplater } from "odt-templater";
```

You can also embed the odt-templater from a CDN.

```js
import { OdtTemplater } from "https://cdn.jsdelivr.net/npm/odt-templater/dist/esm/index.js";
```

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
  const contentFile = zip.file("content.xml");
  if (!contentFile) throw new Error("content.xml not found in the ODT file.");
  const content = await contentFile.async("string");

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

Placeholders are defined in the ODT template file with curly braces. The following syntax is supported:

Single key placeholders:

```
{key}
```

(Replaces with the value of `data[key]`)

Nested key placeholders:

```
{key.key}
```

(Replaces with the value of `data[key][key]`)

An space can be added between the braces and the key:

```
{ key }
{ key.key }
```

#### Example

```
{ title }

Hello {user.first_name} {user.last_name}!

This is an example.
{ description }
```

### Conditionals syntax

Conditions are defined with curly braces, a hash mark, the key being checked, a double equal sign, and the value being compared.

#### Inline conditionals

```js
{#key == value} Hello World {/}
{#key.key == value} Hello World {/}
```

An space can be added between the braces and the key:

```js
{ #key == value } Hello World {/}
{ #key.key == value } Hello World {/}
```

#### Block conditionals

```js
{#key == value}
  Hello World
{/}
```

```js
{#user.first_name == John}
  Hello {user.first_name}
{/}
```

### Empty Conditionals

Check your values for empty strings, null or undefined values.

Empty conditionals are defined with curly braces, a hash mark, and a key.

#### Inline conditionals

```js
{#key} Hello World {/}
{#key.key} Hello World {/}
```

An space can be added between the braces and the key:

```js
{ #key } Hello World {/}
{ #key.key } Hello World {/}
```

#### Block conditionals

```js
{#key}
  Hello World
{/}
```

```js
{#user.first_name}
  Hello {user.first_name}
{/}
```
