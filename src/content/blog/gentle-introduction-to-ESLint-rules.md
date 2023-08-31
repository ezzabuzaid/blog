---
author: ezzabuzaid
pubDatetime: 2022-07-07T12:34:56+00:00
title: Gentle Introduction To ESLint Rules
featured: true
tags:
  - eslint
  - javascript
  - static analysis
  - linter
  - formatter
  - eslint plugin
  - custom esling rules
description: ""
---

Have you ever wondered how your editor can know if you used `var` instead of `let`? or that you missed adding `alt` to the `img` tag? Yes, that is **ESLint** ladies and gentlemen.

In this article, we're going to talk about how this is possible and how you can do something similar!

For you who ain't familiar with [ESLint](https://eslint.org/), I recommend that you read about it in advance and perhaps try to see it in action. The writing presumes that you have at least little knowledge in configuring ESLint.

All the code snippets are available in [Replit](https://replit.com/@EzzAbuzaid1/ESLint) - if you can't see the file in the caption, you've to manually navigate to it from the file explorer.

## Problems

1. One day Javascript rolled out new ways to create a variable (using `let` and `const`) an after some investigation it was mandatory to adapt to the new way, your team agreed and left the office thinking you're crazy. The next day the team have forgotten and it was like nothing happened yesterday.

2. New developer joined and was pretty excited to create its first PR, after the onboarding, the new hire created the PR with inline styles everywhere. The team doesn't like inline styles and considers it a bad practice thus the PR was abandoned with one big comment "HTML files are pretty without inline styles, please consider moving them to the styles files".

3. You're refactoring a legacy class trying to simplify the logic by extracting the master method that does everything based on parameters to a rather set of simple methods. Now the master method is marked as deprecated in favour of the simpler ones.

4. You're working on React SSR project, you've created a component that utilises the navigator object to get the user agent information, the moment the code runs an error appears from nowhere telling you that navigator is undefined because the component has been executed in the server -because of SSR nature-.

5. The team members often forgot to unsubscribe from RxJS observable, the memory halted, you blame Angular, and decides to move to React instead.

All these issues can be dealt with using ESLint. ESLint ain't magic that will instantly solve the code bugs and errors, but it can be a very useful tool to warn you about potential bugs.

Throughout this article, we'll write ESLint rules that address a variety of issues, so let's get to the point directly.

## How ESLint Can Understand The Code

ESLint has two (of many) major concepts:

1. Rule: an object that describes what is about to be validated/linted (More information later).
2. Plugin: Node.js package that exposes a set of rules.

An ESLint rule has a `create` function with one argument (the `context` object) and returns a traverse object.

> The [context](https://eslint.org/docs/latest/developer-guide/working-with-rules#the-context-object) object contains additional functionality that is helpful for rules to do their jobs. As the name implies, the context object contains information that is relevant to the context of the rule.

The traverse object keys are [AST selectors](https://eslint.org/docs/latest/developer-guide/selectors) and the values are functions that take a `Node` object.

```typescript
{
  create(context) {
    return {
      VariableDeclaration: (node) => {},
    };
  },
};
```

Bear with me for a bit, things will get clearer soon! the snippet above is the basis for other definitions.

To know what is the `Node` object and how ESLint can provide it, we need to talk about CS terms.

### Compiler

nope, I mean **Compiler phases** and not the definition of the [Compiler](https://en.wikipedia.org/wiki/Compiler).

Your code (The program) will get smashed down by several layers before it's finally understood by the hardware, these layers are:

1. Scanning.
2. Parsing.
3. There're more but not mandatory to know now.

<small>_Would you like to read more about the compiler or read more about the compiler phases, I recommend this [book](http://craftinginterpreters.com/a-map-of-the-territory.html)_</small>

#### Scanning

The process of reading the source code a character at a time and chunking them into `Tokens`

for instance, when passing this code into the scanner

```js
var foo = "bar";
```

will produce the following tokens

```
Token { type: 'Keyword', value: 'var', start: 0, end: 3 },
Token { type: 'Identifier', value: 'foo', start: 4, end: 7 },
Token { type: 'Punctuator', value: '=', start: 8, end: 9 },
Token { type: 'String', value: '"bar"', start: 10, end: 15 }
```

#### Parsing

The process of reading the output of the **Scanning** phase (tokens) and outputting a tree data structure called **AST** or "Abstract syntax tree". _[go down to learn more about AST](#abstract-syntax-tree-ast)_

for instance, the above tokens will produce

```
Node {
  type: 'Program',
  start: 0,
  end: 15,
  body: [
    Node {
      type: 'VariableDeclaration',
      start: 0,
      end: 15,
      declarations: [Array],
      kind: 'var'
    }
  ],
  sourceType: 'script'
}
```

Finally, we can answer the question what is the `Node` object in the traverse function? simply put a Node is an object that holds information about a specific part of the program like the location of the variable `foo` and its initializer in form of a tree structure.

Let's start with a simple example: prevent the developer from using the `var` keyword, for that, we need to handle nodes of type `VariableDeclaration` - based on the **AST** above the selector for the `var` keyword is `VariableDeclaration` - and when the handler function is invoked we need to warn the developer that `var` shouldn't be used.

```typescript
{
  create(context) {
    return {
      VariableDeclaration: (node) => {
        if (node.kind === "var") {
          context.report({
            node: node,
            message: 'Use "let" instead.',
          });
        }
      },
    };
  },
};
```

<figure>
  {% replit @EzzAbuzaid1/Eslint#use-let.js %}
  <figcaption>In the shell, type `npx eslint use-let.js` to see the result for <u>use-let</u> rule.</figcaption>
</figure>

## ESLint Rule

I guess that's enough about how ESLint process your code, now it's the time to get more involved in writing code.

ESLint rule structure as follows

```typescript
type Rule = {
  meta: {
    hasSuggestion: boolean;
    type: "problem" | "suggestion" | "layout";
    docs: {
      description: string;
      url: string;
      category: string;
      recommended: boolean;
    };
    fixable: "code" | "whitespace";
    schema: [];
  };
  create: Function;
};
```

Check ESLint [rule docs](https://eslint.org/docs/latest/developer-guide/working-with-rules#rule-basics) for complete details

We already covered the create function in the above section, so let's talk about `meta`.

1. `type`: If the rule is for a code structure use "layout", if it's to warn about potential bug/error use "problem", otherwise you might want to stick with "suggestion".
2. fixable: Indicates that the node that represents a segment of the code is fixable (can be fixed automatically) by adding `--fix` options (_More about it later_).
3. schema: In case you want to make the rule configurable (e.g. accept an option to what kind of variable is allowed) you've to add [JSON schema](https://json-schema.org/).
4. hasSuggestion: Indicates that the node that represents a segment of the code has suggestions [go down](#rule-suggestions).
5. docs:
   1. description: Concise yet meaningful description of what the rule does.
   2. url: A link where the user can get more information about the rule (docs or spec).
   3. `category` and `recommended` out of this article's scope.

Let's modify the rule to let the developer decides which kind of variable to dismiss, the option can be accessed using the `context` object.

To specify options, we need to write a valid JSON schema. the `schema` property takes an array of JSON objects. _More information about [the schema](https://json-schema.org/)_

```js
{
  meta: {
    type: "problem",
    schema: [ // HERE
      {
        enum: ["var", "let"],
      },
    ],
  },
  create(context) {
    const [varKind] = context.options;
    return {
      VariableDeclaration: (node) => {
        if (node.kind === varKind) {
          const allowedVarKind = varKind === "var" ? "let" : "var";
          context.report({
            node: node,
            message: `Use ${allowedVarKind} instead.`,
          });
        }
      },
    };
  },
};
```

<figure>
  {% replit @EzzAbuzaid1/Eslint#no-var-kind.js %}
  <figcaption>In the shell, type `npx eslint no-var-kind.js` to see the result for <u>no-var-kind</u> rule.</figcaption>
</figure>

Let's see how ESLint can fix this code for us...

## Rule Fixer

As we saw above the `context.report` function is what warns the developer about the validity of a segment of code.
this function accepts an object that has the node (that represents the code to be reported), message (meaningful message describing why that code is being reported) and **`fix`** function

<small>_Note: there're more properties that the report object can have, which we might explain as we go further and others would be out of this article's scope._</small>

> The fix function receives a single argument, a fixer object, that you can use to apply a fix, it returns a fixing object (the return value of the fixer object methods) or array of fixing objects

Completing the previous example this is how we can auto-fix the reported code. We need to adjust the `meta` object to have the `fixable` option and add the `fix` function to the report object.

```js
{
  meta: {
    ...,
    fixable: "code"
  }
  create(context) {
    const [varKind] = context.options;
    return {
      VariableDeclaration: (node) => {
        if (node.kind === varKind) {
          const allowedVarKind = varKind === "var" ? "let" : "var";
          context.report({
            node: node,
            message: `Use ${allowedVarKind} instead.`,
            fix(fixer) {
              const start = node.start;
              const end =  node.start + 3;
              const range = [start, end];
              return fixer.replaceTextRange(range, allowedVarKind);
            }
          });
        }
      },
    };
  },
};
```

<small>_Note: you shouldn't determine the node range that way, for the sake of not complicating the code, I've added 3 to the start position, for instance, if `var` start position is 5 then the end is 8 because `var` length is 3. Check out [the official rule] (https://github.com/eslint/eslint/blob/main/lib/rules/no-var.js)_ </small>

<figure>
  {% replit @EzzAbuzaid1/Eslint#no-var-kind.js %}
  <figcaption>Make sure you're at no-var-kind.js file first, then in the shell, type `npx eslint no-var-kind.js --fix` to see the result for <u>no-var-kind</u> rule.</figcaption>
</figure>

### Fixer Object

It has a few methods, each return a `fixing` object to mutate the source code, you can either pass the token/node or the range (location) of a token/node.

In case you returned an array of fixing objects, make sure that the fixes ain't stepping on each other, otherwise, ESLint will refuse to apply the fixes for that node/token. _ESLint can determine the conflicts by inspecting the node/token range of all the fix attempts, if the ranges step on each other ESLint will discard all fixes for that node_.

for instance, the fixes in this sample conflicting on the range [4, 5]

```js
fix(fixer) {
  return [
      fixer.replaceTextRange([1, 5], "const"), // changes the var kind to const
      fixer.replaceTextRange([4, 7], "bar") // changes the var name to bar
    ]
}
```

Be wary to add the `fixable` option to `meta` object, otherwise, ESLint will refuse to do any fixes.

Fixer object methods.

- `insertTextAfter(nodeOrToken, text)` - inserts text after the given node or token
- `insertTextAfterRange(range, text)` - inserts text after the given range
- `insertTextBefore(nodeOrToken, text)` - inserts text before the given node or token
- `insertTextBeforeRange(range, text)` - inserts text before the given range
- `remove(nodeOrToken)` - removes the given node or token
- `removeRange(range)` - removes text in the given range
- `replaceText(nodeOrToken, text)` - replaces the text in the given node or token
- `replaceTextRange(range, text)` - replaces the text in the given range

> [More details](https://eslint.org/docs/latest/developer-guide/working-with-rules#applying-fixes)

_Check the examples to see how the fixer object can be used._

<small>_Note: ESLint does not mutate the source code directly rather it does mutate the **AST** and regenerates the code from it_</small>

## Rule Suggestions

What if we want to tell the developer that the code is fine but there might better way to do it. In this case, we shouldn't auto-fix the code, instead, you can provide a suggestion!

for instance, we want to suggest that instead of using the ternary operator you should use the normal `if` statement.

```js
const fooOrBar = true ? "Foo" : "Bar";
```

First thing first, we need to know what the **AST** of the above code looks like, for that we'll use [AST Explorer](https://astexplorer.net/#/gist/c0b8db6949358facd5e4215b0e854f54/31aed03f891566efc339f4c8b6eb3e922a30a699).

The ternary operator node type is `ConditionalExpression`, so we'll use that as an AST selector

Second, the type in `meta` object needs to be `suggestion`. _You only need `hasSuggestions` when the rule does suggest a fix or more._

```js
{
  meta: {
    type: "suggestion",
    hasSuggestions: false,
  },
  create(context) {
    return {
      ConditionalExpression: (node) => {
        context.report({
          node: node,
          message: `What about using if instead?`,
        });
      },
    };
  },
};
```

<figure>
  {% embed https://replit.com/@EzzAbuzaid1/Eslint#ternary.js %}
 <figcaption>In the shell, type `npx eslint no-ternary.js` to see the result for <u>no-ternary</u> rule.</figcaption>
</figure>

Let's take another example but with real suggestions now. the next rule will suggest that if the `var/let` is not being reassigned then it should be const instead.

1. The `hasSuggestions` is true because the rule suggests fixes, also instead of adding `fix` function as part of the report object, we added it as part of the suggestion object in the `suggest` array.
2. The context object has been used before to get the developer options and now it's used to get the whole source code.
3. The [source code](<https://eslint.org/docs/latest/developer-guide/working-with-rules#context.getsourcecode()>) has plenty of useful methods that we are using to get access to the [tokens](#tokens)
4. In a variable declaration, the first token is the variable keyword token and the next one is variable identifier token hence skip the first token.

```js
{
  meta: {
    type: "suggestion",
    hasSuggestions: true,
  },
  create(context) {
    return {
      VariableDeclaration: (node) => {
        if (node.kind !== "const") {
          const sourceCode = context.getSourceCode();
          // the name/identifier of the var/let;
          const varName = sourceCode.getFirstToken(node, { skip: 1 }).value;
          /// continue in the next sample ...
        }
      },
    };
  },
};
```

We've to get all tokens that reference that variable and check if any of them have equal operator as direct sibling and if so then that variable cannot be `const`.

```js
const getAllUsageOfThisVar = sourceCode.getTokensAfter(node, {
  filter: nextToken => nextToken.value === varName,
});

const reassigned = getAllUsageOfThisVar.some(token => {
  const directNextToken = sourceCode.getTokenAfter(token);
  return directNextToken.value === "=";
});
```

In the fix function, get the variable keyword token (we are interested in its exact location in the source code) then replace the text with const.

```js
if (!reassigned) {
  context.report({
    node: node,
    message: `Use const instead.`,
    suggest: [
      {
        desc: "You are not reassigning this variable, would you like to change it to const?",
        fix: function (fixer) {
          const varToken = sourceCode.getFirstToken(node, {
            skip: 0,
          }); // the var/let token
          return fixer.replaceText(varToken, "const");
        },
      },
    ],
  });
}
```

<figure>
  {% replit @EzzAbuzaid1/Eslint#no-var-kind.js %}
  <figcaption>Make sure you're at prefer-const.js file first, then in the shell, type `npx eslint prefer-const.js --fix --fix-type suggestion` to see the result for <u>prefer-const</u> rule. you can as well toggle the comment and rerun the command to see the result difference.</figcaption>
</figure>

_Suggestions are very helpful in the editor experience where it'll show you dropdown of fixes that you can choose from._

![VSCode ESLint suggestions](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ebjgpr41crm2izg3q1kd.png)

## ESLint Parser

ESLint doesn't process the code into the compiler phases, rather it provides an option to let you specify a **Parser**. By default, ESLint uses [**Espree**](https://github.com/eslint/espree) which essentially converts JS source code to AST data structure, so in case you want to write a rule targeting TypeScript source code, you'll need to specify [a different parser](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser) in your `.eslintrc.json` configuration file, same applies for different file extension, for HTML you might use [this](https://github.com/medicomp/eslint-html-parser) or [creating your own parser](https://eslint.org/docs/latest/developer-guide/working-with-custom-parsers)!

_html-parser.js_

```js
exports.parseForESLint = function (code, options) {
  return {
    ast: require("parse5").parse(code),
    services: {},
    scopeManager: null,
    visitorKeys: null,
  };
};
```

[Parser configuration](https://replit.com/@EzzAbuzaid1/Eslint#.eslintrc.json)

Most properly you'll find parsers for all popular extensions - A custom parser is useful in case you want to enrich the generated AST with other properties related to your project or if you're building a custom file extension.

## Rule Tester

What about test, I know you like to write test ^^ and that's why we'll talk about it now...

Unit testing rules is easier and explicit than the traditional test cases that you would write.

All you have to do is to prepare the valid and invalid cases and make sure they are always as stated. Let's go back to **use-let** rule and write test for it.

A sample code that **use-let** rule will find valid

```js
let foo = "bar";
```

A sample code that **use-let** rule will find invalid

```js
var foo = "bar";
```

What we need to do now is use [`RuleTester`](https://eslint.org/docs/latest/developer-guide/nodejs-api#ruletester) to verify this requirement, it takes an object similar to the one you'd use in the in top level `.eslintrc.json`.

_This class is wrapper over mocha testing library._

The `valid` and `invalid` options take an array of cases. The easier way to write a valid test case is by using the static `only` method, it takes the program to run the test against.
The invalid test case are bit more rich, you've to add the invalid program as well as the errors array that should present, the errors are can be as simple as message or more complex by adding the location and node type and [so on](https://eslint.org/docs/latest/developer-guide/nodejs-api#ruletester)

```js
const rule = require("./use-let.rule.js");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
  },
});

ruleTester.run("use-let", rule, {
  valid: [RuleTester.only(`let foo = "bar";`)],
  invalid: [
    {
      code: `var foo = "bar";`,
      errors: [{ message: 'Use "let" instead' }],
    },
  ],
});
```

## Plugins Folder Structure

This is an opinionated folder structure and nothing like what ESLint [recommend](https://eslint.org/docs/latest/developer-guide/working-with-rules)

Will start with folder in the root workspace named "plugins", each folder under this one is a plugin folder with all files related to it. A plugin is essentially an **npm** package that you can either publish it to a registry or link it locally. All the examples in this article are [linked locally](https://replit.com/@EzzAbuzaid1/Eslint#package.json).

_You do not have to use npm link for that, only add the plugin name and the path to it._

_Folder structure tree for ESLint plugins._

```
plugins
└── <plugin-name>
    ├── rules
    │   ├── <rule-name> # Each rule should have all the required files
    │   │   ├── use-let.rule.js # use-let as an example
    │   │   ├── use-let.test.js
    │   │   └── use-let.docs.md # It's always good to have docs.
    │   └── <rule-name-2> # Each rule should have all the required files
    │       ├── prefer-const.rule.js
    │       ├── prefer-const.test.js # Make sure to test every case!
    │       └── prefer-const.docs.md
    ├── index.js # exports the plugin rules
    └── package.json # look below.
```

The `package.json` file should have at least the `name` "eslint-plugin-'plugin-name'" and `main` pointing to the rules exports file (index.js).

## Examples

Let's write few more examples of ESLint rules and discover their potential.

### Image alternative text (img alt)

Because we're validating HTML code we've to use a parser that can transform the HTML code to **AST**, so for that we'll use [eslint-html-parser](https://www.npmjs.com/package/eslint-html-parser) and add it in the _[.eslintrc.json](https://replit.com/@EzzAbuzaid1/Eslint#.eslintrc.json)_ file.

This rule will report a message in case `img` tag doesn't have the `alt` property.

Here's a sample HTML code

```html
<img src="..." />
```

The AST is - _some properties omitted for brevity_.

```
 {
  type: 'HTMLElement',
  tagName: 'img',
  range: [ 0, 14 ],
  children: [],
  attributes: [
    {
      type: 'HTMLAttribute',
      range: [Array],
      attributeName: [Object],
      attributeValue: [Object],
      value: 'src=""',
    }
  ]
}
```

1. In the `meta.docs` we added `url` property that give more info about the rule.
2. The AST selector of an HTML element is `HTMLElement`.
3. The `if` ignores all element that are not `img` tag.
4. If the `img` element have an `alt` regardless if it does have value or not then we do not report.

```js
{
  meta: {
    type: "problem",
    docs: {
      description: "Img tag should have an alt property",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#accessibility_concerns",
    }
  },
  create: function (context) {
    return {
      HTMLElement: function (node) {
        if (node.tagName === "img") {
          const hasAltAttribute = node.attributes.some(
            (item) => item.attributeName.value === "alt"
          );
          if (!hasAltAttribute) {
            context.report({
              node: node,
              message: "Where is the alt? consider adding empty alt in case the img doesn't convey any meaning.",
            });
          }
        }
      },
    };
  },
};
```

<figure>
  {% replit @EzzAbuzaid1/Eslint#img-alt.html %}
  <figcaption>In the shell, type `npx eslint img-alt.html` to see the result for <u>img-alt</u> rule.</figcaption>
</figure>

### Figure Tag

This rule will report a message in case `img` tag is not within `figure` tag.

1. The first `if` ignores all element that are not `img` tag.
2. We walk all the way up till we find `figure` tag parent.

```js
{
  meta: {
    type: "problem",
    ...other propreties
  },
  create: function (context) {
    return {
      HTMLElement: function (node) {
        if (node.tagName === "img") {
          let parent = node.parent;
          while (parent && parent.tagName !== "figure") {
            parent = parent.parent;
          }
          if (parent?.tagName !== "figure") {
            context.report({
              node: node,
              message: "img tag should be wrapped within figure tag.",
            });
          }
        }
      },
    };
  },
};

```

<figure>
  {% replit @EzzAbuzaid1/Eslint#img-figure.html %}
  <figcaption>In the shell, type `npx eslint img-figure.html` to see the result for <u>img-figure</u> rule.</figcaption>
</figure>

_Wait! challenge for you, complete the rule to report a message in case `figcaption` is not within the `figure` tag._

### No Console

This rule will report a message whenever console method is present.

This sample code

```js
console.log("Are you bored yet?");
```

Will give the following AST - _some properties omitted for brevity_.

```
Node {
  type: 'CallExpression',
    callee: {
    type: 'MemberExpression',
      object: {
      type: 'Identifier',
      name: 'console',
    }
    property: {
      type: 'Identifier',
      name: 'log',
    }
  }
}

```

So in order to check if any method from the console object is used we have to use `CallExpression` as AST selector and in the handler we need to inspect the callee property to make sure the method is part of the `console` object and if so we report an error.

```js
{
  meta: {
    type: "problem",
  },
  create(context) {
    return {
      CallExpression: (node) => {
        if (node.callee.object?.name === "console") {
          context.report({
            node: node,
            message: `console.${node.callee.property.name} is cool but some people doesn't like it.`,
          });
        }
      },
    };
  },
};
```

_<small>This of course won't cover all cases, for instance, code like the following won't be discovered by the logic we wrote above because we are no longer calling the `console.log` directly thus we lost the `CallExpression` signature. A proper solution is to report whenever a console method present and for that we've to use `MemberExpression` AST selector. </small>_
_<small>The why we've not actually did this because I want you to be wary of such cases that can be easily forgotten.</small>_

```js
const log = console.log;
log();
```

<figure>
  {% replit @EzzAbuzaid1/Eslint#no-console.js %}
  <figcaption>In the shell, type `npx eslint no-console.js` to see the result for <u>no-console</u> rule.</figcaption>
</figure>

### Comments

Let's see how we can leverage the comments and make them useful in different way.

In this example we want to report a message in case a declaration annotated with `@private` tag is being used in specific directory (make sure to limit this rule to specific files in `.eslintrc.json`).

```js
/**
 * @private Never use this function.
 */
function _internalFunction() {}

_internalFunction(); // an error will be reporated

/**
 * @private and this constant
 */
const nil = null;

if (nil === null) {
  // you should see warning in the console ^^
}
```

So in order to target all nodes we need to use the `Program` node in the following steps

1. Extract all tokens from it.
2. Create a loop that starts from the first token.
3. Ignore any token that isn't a `Keyword` (afaik, you can only annotate Keywords "function", "const", "class" and so on).
4. Ignore any keyword that doesn't have comments.
5. Ignore in case the comments doesn't have `@private` annotation.

```js
 {
  meta: {
    type: "problem",
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      Program: (node) => {
        const tokens = sourceCode.getTokens(node);
        for (let index = 0; index < tokens.length; index++) {
          const token = tokens[index];
          if (token.type !== "Keyword") {
            continue;
          }
          const comments = sourceCode.getCommentsBefore(token);
          if (!comments.length) {
            continue;
          }
          const privateTagMessage = getCommentTagMessage(comments, "@private");
          if (!privateTagMessage) {
            continue;
          }
        }
      },
    };
  },
};
```

Once we found a keyword with comments that have `@private` tag we need to find all references to it.

1. From the previous sample the `index` is pointing at the keyword token.
2. Get the keyword Identifier token (the identifier is always the next token after the keyword token).
3. Create new loop that starts from the token after the keyword identifier to gather the references.
4. Since we only need the references to the keyword token we need to ignore any token that is not Identifier or doesn't have the same value (identifier name) as the keyword identifier.
5. Once we found a reference we report the private tag message

```js
const keywordIdentifier = tokens[index + 1];
for (const nextToken of tokens.slice(index + 2)) {
  if (
    nextToken.type === "Identifier" &&
    nextToken.value === keywordIdentifier.value
  ) {
    const message = privateTagMessage;
    context.report({
      node: nextToken,
      message: `${keywordIdentifier.value}: ${message}`,
    });
  }
}
```

<figure>
  {% replit @EzzAbuzaid1/Eslint#no-console.js %}
  <figcaption>In the shell, type `npx eslint private.js` to see the result for <u>private</u> rule.</figcaption>
</figure>

### Deprecate a function

What about you creating this to test your understanding, here's how

1. Create another folder in the plugins directory named _deprecated_.
2. Create rules folder inside that directory and within it another folder named _deprecate-function_.
3. In the _deprecated_ folder create two files, `index.js` to export the rule and `package.json` to make the plugin npm module.
4. In the _deprecate-function_ folder create two files, _deprecate-function.rule.js_ and _deprecate-function.test.js_.

The folder structure should look like this

```
plugins
└── deprecated
    ├── rules
    │   └── deprecate-function
    │       ├── deprecate-function.rule.js # rule logic
    │       └── deprecate-function.test.js # rule unit test
    ├── index.js # exports the plugin rules
    └── package.json # make the plugin npm package.
```

Now the rule should do the following

1. Accepts an array of function names to deprecate (`scheme` option).
2. If the function name is not defined then ignore (don't report).
3. use the `Identifier` selector and check if its name is exist in the functions names array (you need to use `context.options`).
4. In case the `If` statement conditioned then report a message (you can make the message option as well!).

## AST selectors

We've already talked about AST selector before so this is a complement to the writing.

You already know the CSS selectors like `*`, `[]`, `>`, ...etc, you actually can use those selectors along with the AST selectors, for instance, if you want to find variables with name foo you can use the attribute selector instead of doing an extra `if` statement.

```js
{
  create(context) {
    "VariableDeclaration[name="foo"]": () => { }
  }
}
```

## Postface

ESLint rules are not only a way to ensure the developer adheres to a specific style of coding, the way I see it, with ESLint you can build habits in the team members to do the things as routine and not a checklist of things they have to pass.

Following that, you can benefit from ESLint by creating rules that will help new joiners adapt easily to the codebase or folks from other teams who frequently participate in a codebase.

Final thought, ESLint rules can be developer guidelines for a codespace.

## Bounce Sections

That's specially for you ^^ to enrich your information!

### Abstract Syntax Tree (AST)

We already talked about compiler phase/stages and how each of them is essentially a step towards making the computer understands the code. One of these stages is Parsing which outputs **AST**.

**AST** is the source code in tree data structure that represents the relation between the tokens, for instance, this sample code

```js
var foo = "bar";
```

will output the following

![AST Of variable declaration](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/32uc0836qgetnjy6aodo.png)

As you can see there's root node `Program` which is the source code (the variable foo), the body contains list of nodes because usually you've more than one statement 🙂. The `VariableDeclaration` node is a statement that have the type of declaration and because it's variable and the variable have different kinds, there's `kind` property.

In the declarations array there's Variable declarator that have information about the var identifier (name) and its initializer.

The node term is an abstract therefore each specific of the node have different properties related to it, for instance `BinaryExpression` statement (5 + 1) will have left and right properties that have information about the operands an so on.

We've been utilising the AST so far for **Static Code Analysis** but that's not the only usage of it. You can also create code migration tools using the AST, like changing functions names or removing parameters and more complex usage.

### AST Explorer

[AST Explorer](https://astexplorer.net/) is an amazing website if you're working with **AST**s, it has plenty of parsers for the most of things that you might hear about, for instance it has an option to parse [SQL Query](https://astexplorer.net/#/gist/7716b472702de7f9de5343972a9bac1d/latest) and [GraphQL](https://astexplorer.net/#/gist/d0afa17bcbc6b7895a57db452bbf3362/latest) and many more.

This this the toolbar
![AST explorer elaboration](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/a9elsjcvpg784x58vj7x.png)

Beside the AST Explorer logo we have 1. **Snippet**: In case you want to share, reset the state of the page, or save. (**New** button, will clear the url and **Save** will let you create new url to share) 2. **JavaScript**: A dropdown where you select the language/tool that you want to parse. 3. **espree**: A dropdown where you select the a library to parse the selected language/tool. 4. **transform** toggle: some languages/tools can be transformed to older version or different syntax. This option will be enabled in case transformation is supported for the selected language/tool.
