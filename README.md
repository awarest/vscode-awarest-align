# vscode-awarest-align

Alignment and formatting helpers for whitespace, symbols, and transposing. ([Marketplace]) ([GitHub])

## Overview

This extension exposes four types of alignment and formmatting helper commands. Due to
variations between operating systems and keyboard shortcut preferences, it no longer adds any
keyboard shortcuts automatically, but see below for some suggestions and instructions on adding
your own set of keyboard shortcuts. This is intended to be a semi-opinionated approach with
some obvious room for improvement. Please open an [issue] on [GitHub] if you believe something
should be different or configurable and we can discuss a PR or I'll make a quick change.

## Commands

Each of the four main commands behave differently depending on if a single line or multiple
lines are selected. If only a single line is selected (see above), then the transposing
commands will attempt to split it into multiple lines. For alignment commands, the characters
to align by are simply have their repeating duplicates removed if there are any.

**General** - These items apply to all commands unless explicitly stated otherwise.

* Conforms and preserves the maximum indentation of the line or lines selected
* Removes duplicate repeating separator or alignment characters except the indentation
* Alignment is handled by inserting spaces before the start of a word or set of characters
* Each line being handled has any whitespace trimmed on both ends except the indentation
* Blank lines, even if within the selection, are generally ignored or eliminated if transposing
* Commands can be executed by pressing `ctrl+shift+p` to open the command palette and searching
* If executing a command manually, you will be prompted to provide the character or characters
* For keybindings, the `args` property allows you to provide the characters, but isn't required

![alt text](/imgs/general.gif "General Examples")

**First Occurrence** - Aligns the selected lines using whitespace so the provided character or
characters line up vertically including one space prior. When using on a single line, any
whitespace before or after the first instance of the provided characters will be removed. Lines
that don't contain the provided character or characters are skipped except to conform the
indentation.

![alt text](/imgs/first.gif "First Occurrence Examples")

**Each Occurrence** - Aligns the selected lines using whitespace so that each instance of the
provided character or characters are the furthest to the right they need to be to make the
first character after the one or ones provided line up vertically. Lines that don't contain the
provided character or characters are skipped except to conform the indentation. If a line has
less than the maximum number of instances, only the matching number of items are aligned for
that specific line.

![alt text](/imgs/each.gif "Each Occurrence Examples")

**Transpose Lines** - Transposes multiple lines into one or a single line into many based on
the provided separator character or characters. Each newly created line will be inserted below
preserving the same indentation as the originally selected single line. When multiple lines are
selected, they are trimmed and converted into a single line delimited by the separator with
blank lines being elimated and the maximum indentation preserved for the resulting line.

![alt text](/imgs/lines.gif "Transpose Lines Examples")

**Transpose List** - Special handling to transposes multiple lines into one or a single line
into many based on the provided separator character or characters and looking for opening and
closing wrappers of `()`, `{}`, or `[]`. When converting to multiple lines, an additional
linebreak is added after the first opening wrapper and before the last closing wrapper. This is
generally used with a comma as the separator and would result in splitting a single line
bracket wrapped and comma separated list into one line for the opening, one line for the
closing, and one line for each of the items in the list. Multiple line lists result in trailing
commas, or the provided separator, and single line lists result in stripping the final
separator before the closing wrapper character. The list items behave generally like the
Transpose Lines command above, but an additional two space "tab" (see Assumptions below) is
added for each item when transforming into multiple lines. Blank lines or repeating separators
split only by whitespace are generally eliminated.

![alt text](/imgs/list.gif "Transpose List Examples")

**Transpose HTML** - Works in a similar way to the Transpose Lines or List items above, but has
some special handling for working with HTML tags and multiple attributes. When transposing into
multiple lines, it will add an extra indent to each property. Also, if the last characters are
either `/>` or `>`, they will be split onto their own line without the additional indentation.
When merging down to a single line, each line break gets converted into a space, except the
space just prior to `/>` or `>` gets stripped out to snug things up nicely. Importantly, spaces
within single or double quoted areas are ignored when deciding how to wrap into new lines.

![alt text](/imgs/html.gif "Transpose HTML Examples")

## Selections

Commands function differently depending on if you have a single line or multiple lines
selected. They will function in "single line" mode if you have nothing selected (it acts on the
line your cursor is on) or your selection only contains portions of a single line and your
cursor is at the start of the following line. Also, they always work based on "whole lines"
only. That means if part of a line is selected, the entire line is handled.

![alt text](/imgs/single-line.gif "Single Line Examples")

![alt text](/imgs/multi-line.gif "Multi Line Examples")

## Keybindings

The following are a set of suggested key bindings that can be copy/pasted into your keyboard
shortcuts file by opening the command pallete (`ctrl+shift+p`) and typing or finding
`Preferences: Open Keyboard Shortcuts File`. All commands are also available without creating
a keyboard shortcut if you would like to test things first.

| Available Commands          | Title                          |
| --------------------------- | ------------------------------ |
| extension.awarestAlignEach  | Awarest Align Each Occurrence  |
| extension.awarestAlignFirst | Awarest Align First Occurrence |
| extension.awarestAlignLines | Awarest Align Transpose Lines  |
| extension.awarestAlignList  | Awarest Align Transpose List   |
| extension.awarestAlignHtml  | Awarest Align Transpose HTML   |

**Keybinding Examples and Suggestions:**

```json
  { "key": "meta+/",          "command": "extension.awarestAlignFirst", "args": "//" },
  { "key": "meta+;",          "command": "extension.awarestAlignFirst", "args": ": " },
  { "key": "meta+space",      "command": "extension.awarestAlignEach",  "args": " "  },
  { "key": "meta+,",          "command": "extension.awarestAlignList",  "args": ","  },
  { "key": "meta+.",          "command": "extension.awarestAlignHtml",  "args": " "  },
  { "key": "meta+enter",      "command": "extension.awarestAlignLines", "args": " "  },
  { "key": "meta+ctrl+space", "command": "extension.awarestAlignFirst", "args": " "  },
```

**Note:** The `meta` key is also known as the Windows Key or Command (⌘) on MacOS

## Settings

The EOL (end of line aka linebreak) and TAB values are now configurable through your typical
user or workspace settings. The defaults are for unix style (LF aka `\n`) EOL and two spaces
for tabs (used when transposing a list or html). Be sure to configure the EOL if you are on
Windows (CRLF aka `\r\n`) or using non-unix style for any other reason. That value gets used
a lot to replace EOLs that get trimmed when cleaning up text in general.

```json
  "awarestAlign.eol": "\n",   // default
  "awarestAlign.eol": "\r\n", // windows eol

  "awarestAlign.tab": "  ",   // default
  "awarestAlign.tab": "\t",   // tab character
  "awarestAlign.tab": "    ", // four space tabs
```

## Known Issues

* Multi Cursor Selections - only really handles the first cursor's selected area
* Preserving Spacing in Quoted Strings - currently does not handle quoted strings differently
* Escape Character/Symbol Support - i.e. currently isn't a way to ignore a comma inside quotes
* Partial Line Selections - if part of a line is selected, the entire line is always impacted

## Learning

An additional goal of writing this was to better understand the internals of how an extension
actually works. Even if you don't have a use for this, hopefully it can help give an actual
example with a near excessive amount of inline code comments for anyone interested in writing
something their self, it is actually pretty straight forward. About 90% of anything you would
need to know to create a basic extension such as this appears in only two files: [package.json]
and [src/extension.ts] that can be viewed in the [GitHub] repository. Feel free to open an
[issue] on there if something isn't clear and/or if you believe something wasn't done very
well, because that is pretty likely.

If you are going to dig into how this works, and it really is pretty straight forward, you will
notice that there are really only two main functions. Each of those have a specific logic tree
depending on the actual sub type. The easiest place to start would be the `activate` function
at the bottom of the [src/extension.ts] file and pick one of the registered commands to trace.

Heavily inspired by a method of whitespace alignment in Sublime Text 3 using [randy3k/AlignTab]

Also referenced and learned a lot from the VS Code extension [annsk/vscode-alignment]

You can find me on Twitter as @brian_jorden

<!-- links -->
[Marketplace]: https://marketplace.visualstudio.com/items?itemName=awarest.awarest-align
[GitHub]: https://github.com/awarest/vscode-awarest-align
[issue]: https://github.com/awarest/vscode-awarest-align/issues
[package.json]: https://github.com/awarest/vscode-awarest-align/blob/master/package.json
[src/extension.ts]: https://github.com/awarest/vscode-awarest-align/blob/master/src/extension.ts
[randy3k/AlignTab]: https://github.com/randy3k/AlignTab
[annsk/vscode-alignment]: https://github.com/annsk/vscode-alignment

## Release Notes

---

### 1.1.0 - (2018-02-05)

* Changed the TAB and EOL values to be pulled from configuration instead of hard coded
* New default settings provided (for above mentioned TAB/EOL)
* Added a new Transpose mode to better work with HTML with multiple attributes
* As part of the HTML functionality, created a basic way to ignore spaces inside quotes
* Future update still needed to fully handle spaces inside quotes for other alignment modes
* Added links to the GitHub repo and Marketplace listing to the start of the README file

---

### 1.0.2 - (2018-01-08)

* Minor tweak to order of information in README.md for clarity

---

### 1.0.1 - (2018-01-08)

* Major rewrite, new functionality, updates, and breaking changes
* Removed automatically included keybindings due to OS conflicts
* Greatly expanded the readme, usage info, and example screenshots
* This updated README.md should serve as the initial release notes

---

### 0.4.0 - (and older)

* Release notes were not tracked in detail.
