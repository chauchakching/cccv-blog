---
title: The Right Setup to Run TypeScript with Node.js and Importing ESM NPM Modules in a TypeScript Web Frontend
date: "2023-05-04"
---

In this blog post, we will discuss the discovery and teaching of the right setup to run TypeScript with Node.js and importing some ESM NPM modules, inside the `scripts` folder, under the repo setup that is for a TypeScript web frontend, without changing config files on the repo root level.

## Constraints and Conditions

Before we dive into the key points of the setup, let's take a look at the constraints and conditions we will be working with:

1. The project should be a TypeScript web frontend.
2. We should run TypeScript with Node.js and import ESM NPM modules.
3. The setup should be done inside a `scripts` folder.
4. No config files on the repo root level should be changed.

Now, let's proceed with the key points of the setup.

## Key Points of the Setup

### 1. Run `ts-node` with `--esm` Flag

In order to run TypeScript with Node.js and import ESM NPM modules, we need to use the `--esm` flag when running `ts-node`. This enables support for ECMAScript modules.

```bash
ts-node --esm script.ts
```

### 2. Create `package.json` in the `scripts` Folder

Inside the `scripts` folder, create a `package.json` file with just one property, `type: "module"`:

```json
{
  "type": "module"
}
```

This tells Node.js that all JavaScript files in this folder should be treated as ECMAScript modules.

### 3. Create a Separate `tsconfig.json` in the `scripts` Folder

We need a separate `tsconfig.json` file in the `scripts` folder to configure TypeScript for our Node.js scripts. This allows us to have different TypeScript configurations for the web frontend and the `scripts` folder.

Create a `tsconfig.json` file in the `scripts` folder with the following content:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2020",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "outDir": "./dist",
    "baseUrl": "."
  },
  "include": ["./**/*.ts"]
}
```

This configuration sets the module system to `ESNext` and the target to `ES2020`, which enables support for ECMAScript modules and modern JavaScript features.

### 4. Use `.js` Extension in TypeScript Script Imports

When importing another TypeScript file in the `scripts` folder, use the `.js` extension for the relative import path, as required by the ESM specification in Node.js. However, do not use the `.ts` extension, as this will cause a TypeScript error.

```typescript
// Correct import statement
import { myFunction } from "./myModule.js"

// Incorrect import statement
import { myFunction } from "./myModule.ts"
```

By following these key points, you can set up a TypeScript project with Node.js and import ESM NPM modules without changing any config files on the repo root level, while keeping everything inside the `scripts` folder.

---

# Generated by ChatGPT gpt-4

The above blog post was 100% generated by gpt-4 with the following prompt:

> write a blog post in markdown syntax about the discovery and teaching of the right setup to run typescript with nodejs and importing some esm npm modules, inside `scripts` folder, under the repo setup that is for a typescript web frontend, without changing config files on the repo root level.
> Specify the constraints and conditions beforehand.
>
> Then, for the key points of the setup involves
>
> - running `ts-node` with `--esm` flag
> - creating `package.json` in the `scripts` folder, with just one property `type: "module"`
> - creating a separate `tsconfig.json` in the `scripts` folder
> - in typescript script in`scripts` folder, when importing another ts file, the relative import path should includes extension `.js` because of esm requirement of nodejs, but not `.ts` because of typescript error
