---
author: ezzabuzaid
pubDatetime: 2023-12-19T00:00:00Z
title: "Migrating from until-destroy to takeUntilDestroyed"
featured: false
draft: false
heroImage: migrating-from-until-destroy-to-takeUntilDestroyed
tags:
  - angular
  - typescript
  - guide
description: "Migrating to Angular's latest feature, DestroyRef, streamlines component cleanup, pairing seamlessly with takeUntilDestroyed using codemod"
---

Angular has been releasing new things nonstop, one of which Is the `DestroyRef` token, a utility class that provides an `onDestroy` hook that is called when a component/directive is destroyed.

```ts
@Component({...})
class IAmAHookComponent {
 constructor() {
   inject(DestroyRef).onDestroy(() => {
     // Have something to clean up before I go?
   })
 }
}
```

We already have this with the `OnDestroy` interface, but the cool thing about `DestroyRef` is that it works wonderfully with another utility function named `takeUntilDestroyed`

## Problem

Before `takeUntilDestroyed` you’ve to do something similar to unsubscribe from an observable `stream$`

```ts
@Component({...})
export class OldSchoolUnsubscribeComponent implements OnInit, OnDestroy {
_destroy: Subject<void> = new Subject<void>();

 ngOnInit(): void {
   stream$
     .pipe(takeUntil(this._destroy))
     .subscribe();
 }

 ngOnDestroy(): void {
   this._destroy.next();
 }
}
```

With `DestroyRef` and `takeUntilDestroyed` you can do the following:

```ts
export class NewWayComponent implements OnInit {
  _destroy: DestroyRef = inject(DestroyRef);

  ngOnInit(): void {
    _stream.pipe(takeUntilDestroyed(this._destroy)).subscribe();
  }
}
```

Pretty cool, isn’t it?

Previously, I’ve used the fantastic `until-destroy` package that does what the `takeUntilDestroyed` does but using a decorator.

```ts
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({...})
export class UsingPackageComponent {
 ngOnInit() {
   _stream.pipe(untilDestroyed(this)).subscribe();
 }
}
```

Very similar. However, I always prefer to maximize the framework’s usage as much as possible. As we already have a method now to do it the Angular way, I’d instead remove a package from my `node_modules`

## Solution

You can change them manually, or you can write a script to modify the code for you. In the last blog, we talked about how we can use TypeScript compiler API to do code modification. This case is one of many that the compiler API excels at. That being said, we are going to use the `ts-morph` package today:

1. To learn something.
2. As of today, you cannot instruct the TypeScript AST printer to respect the original code formatting (although you can apply prettier right after code modification to get it back as it was). Hence, `ts-morph`
3. `ts-morph` offers a friendly API to manipulate the source code

Starting with Installing ts-morph
`npm i ts-morph`

Create a morph project and select Angular-related files

```ts
import * as morph from "ts-morph";

const project = new morph.Project({
  // Change it to select the project you want to update.
  tsConfigFilePath: "./tsconfig.json",
});

// Get all the source files that match the angular pattern (e.g., "*.component.ts")
const files = project.getSourceFiles(
  `/**/*.+(component|directive|pipe|service).ts`
);
```

Keep in mind that you’re only going to migrate the first case of using `until-destroy` mentioned above. if you’re using `checkProperties,` `arrayName,` or `blackList,` you’ve to improve on the code.

## The Code

The plan is to iterate over all files from `ts-morph` and then loop over all classes in each file.

```ts
// Iterate through each component file
for (const file of files) {
  const classes = file.getDescendantsOfKind(morph.SyntaxKind.ClassDeclaration);
  for (const clazz of classes) {
    // Codemod Logic goes here
  }
}
```

Moving next, you need to filter out the classes that don’t need to be modified. There are four situations where a class is not modifiable:

1. The class doesn’t have an Angular-related decorator.
2. The class doesn’t have a `UntilDestroy` decorator.
3. The `UntilDestroy` decorator has options in it.
4. The `untilDestroyed` function is not used in the class.

The class doesn’t have an Angular-related decorator.

```ts
for (const clazz of classes) {
  {
    // only migrate classes that have @Component, @Directive, @Pipe or @Injectable decorators
    const angularDecorators = ["Component", "Directive", "Pipe", "Injectable"];
    const angularClass = clazz.getDecorator(dec =>
      angularDecorators.includes(dec.getName())
    );
    if (!angularClass) {
      continue;
    }
  }
}
```

The class doesn’t have a `UntilDestroy` decorator.

```ts
{
  // @UntilDestroy() is our indication that the class needs to be migrated
  const untilDestroyDecorator = clazz.getDecorator(
    dec => dec.getName() === "UntilDestroy"
  );

  if (!untilDestroyDecorator) {
    continue;
  }
}
```

The `UntilDestroy` decorator has options in it.

```ts
// if options is specified then skip this file
const [optionsArg] = untilDestroyDecorator?.getArguments() ?? [];
const haveOptions = (
  optionsArg as morph.ObjectLiteralExpression
)?.getProperties().length;
if (haveOptions) {
  continue;
}
```

The `untilDestroyed` function is not used in the class. You need to get all calls to `untilDestroyed` via querying the class for `CallExpression` nodes and check the name of each node to equal `untilDestroyed`

```ts
{
  // migrate untilDestroyed() to takeUntilDestroyed()
  const untilDestroyedCalls = clazz
    .getDescendantsOfKind(morph.SyntaxKind.CallExpression)
    .filter(call => {
      const identifier = call.getLastChildByKind(morph.SyntaxKind.Identifier);
      return identifier?.getText() === "untilDestroyed";
    });

  if (!untilDestroyedCalls.length) {
    continue;
  }
}
```

With checks in place, you can move to do the code modification. There are 3 places that can contain an `untilDestroyed`

Within the constructor

```ts
@UntilDestroy()
@Injectable()
export class InboxService {
  constructor() {
    interval(1000).pipe(untilDestroyed(this)).subscribe();
  }
}
```

Within a method

```ts
@UntilDestroy()
@Component({})
export class InboxComponent {
  ngOnInit() {
    interval(1000).pipe(untilDestroyed(this)).subscribe();
  }
}
```

Inlined in the class body

```ts
@UntilDestroy()
@Component({})
export class HomeComponent {
  subscription = fromEvent(document, "mousemove")
    .pipe(untilDestroyed(this))
    .subscribe();
}
```

So you need to loop over `untilDestroyedCalls` from above and check where each `untilDestroyed` call is being used and, based on that fact, invoke the modification logic.

```ts
// You need destroyRef in case takeUntilDestroyed(this._destroyRef) have been used
let doWeNeedDestroyRef = null;

for (const untilDestroyedCall of untilDestroyedCalls) {
  const withinConstructor = untilDestroyedCall.getFirstAncestorByKind(
    morph.SyntaxKind.Constructor
  );
  const withinMethod = untilDestroyedCall.getFirstAncestorByKind(
    morph.SyntaxKind.MethodDeclaration
  );

  switch (true) {
    case !!withinConstructor:
      // takeUntilDestroyed if used within the constructor can auto-infer the destroyRef
      // from the injection context
      untilDestroyedCall.replaceWithText("takeUntilDestroyed()");
      break;
    case !!withinMethod:
      // takeUntilDestroyed if used within a method needs to be passed the destroyRef
      untilDestroyedCall.replaceWithText(
        "takeUntilDestroyed(this._destroyRef)"
      );

      // set doWeNeedDestroyRef to true so that you can add the _destroyRef property
      doWeNeedDestroyRef ??= true;
      break;
    default:
      // Assuming the observable is declared directly in the class
      // body so you treat it as if it were within the constructor
      untilDestroyedCall.replaceWithText("takeUntilDestroyed()");
      break;
  }
}
```

You might have noticied the variable `doWeNeedDestroyRef` that is used to determine if you need to add the `_destroyRef` property to the class. If you’re using `untilDestroyed` within a method, you need to add the `_destroyRef` property to the class.

```ts
{
  // add Inject DestroyRef after last public property
  if (doWeNeedDestroyRef) {
    const lastPublicProperty = clazz
      .getInstanceProperties()
      .filter(prop => prop.getScope() === morph.Scope.Public);
    clazz.insertProperty(lastPublicProperty.length, {
      name: "_destroyRef",
      scope: morph.Scope.Private,
      initializer: "inject(DestroyRef)",
    });
  }
}
```

Alternativly, you can use `_destroyRef` with `takeUntilDestroyed` always and avoid this check.

Last but not least, you need to remove the `until-destroy` import and `UntilDestroy` decorator.

```ts
{
  // ...
  if (!untilDestroyedCalls.length) {
    continue;
  }
  // remove @UntilDestroy() decorator
  untilDestroyDecorator.remove();
}
```

Remove the `until-destroy` import

```ts
{
  // remove untilDestroyed import
  const untilDestroyedImport = file.getImportDeclaration(
    imp => imp.getModuleSpecifierValue() === "@ngneat/until-destroy"
  );
  untilDestroyedImport?.remove();
}
```

Finally, you need to ensure the `DestroyRef` and `takeUntilDestroyed` imports are set then save the file.

```ts
{
  // add imports if needed
  if (fileMigrated) {
    const imports: [string, string[]][] = [
      ["@angular/core", ["inject", "DestroyRef"]],
      ["@angular/core/rxjs-interop", ["takeUntilDestroyed"]],
    ];
    setImports(file, imports);
    file.saveSync();
  }
}

function setImports(
  sourceFile: morph.SourceFile,
  imports: [string, string[]][]
): void {
  imports.forEach(([moduleSpecifier, namedImports]) => {
    const moduleSpecifierImport =
      sourceFile
        .getImportDeclarations()
        .find(imp => imp.getModuleSpecifierValue() === moduleSpecifier) ??
      sourceFile.addImportDeclaration({
        moduleSpecifier,
      });
    moduleSpecifierImport.addNamedImports(namedImports);
  });
}
```

## Demo

> [Demo & Complete Code](https://stackblitz.com/edit/stackblitz-starters-emxuvu?file=package.json&view=editor): To run this code, open the terminal at the bottom and run "npx ts-node ./index.ts"

Navigate to examples folder where you'll see how the code is migrated.

## Conclusion

The `ts-morph` API although simple and to the point it still might confuse you if you're not familiar with the TypeScript compiler API. You can read the [Gentle Introduction To Typescript Compiler API](https://writer.sh/posts/gentle-introduction-to-typescript-compiler-api/) to get a better understanding of the TypeScript compiler API.

Make sure to run the script on a clean repository (commit any code) as it will modify the code in place.

## References

- [Getting to Know the DestroyRef Provider in Angular](https://netbasal.com/getting-to-know-the-destroyref-provider-in-angular-9791aa096d77)
- [Until Destroy](https://github.com/ngneat/until-destroy)
