# vscode-awarest-align

Alignment and formatting helpers for whitespace, symbols, and transposing.

## Overview

This extension exposes four types of alignment and formmatting helper commands. Due to
variations between operating systems and keyboard shortcut preferences, it no longer adds any
keyboard shortcuts automatically, but see below for some suggestions and instructions on adding
your own set of keyboard shortcuts. This is intended to be a semi-opinionated approach with
some obvious room for improvement. Please open an [issue] on [GitHub] if you believe something
should be different or configurable and we can discuss a PR or I'll make a quick change.

## Selections

Commands function differently depending on if you have a single line or multiple lines
selected. They will function in "single line" mode if you have nothing selected (it acts on the
line your cursor is on) or your selection only contains portions of a single line and your
cursor is at the start of the following line. Also, they always work based on "whole lines"
only. That means if part of a line is selected, the entire line is handled.

![alt text](/imgs/single-line.gif "Single Line Examples")

![alt text](/imgs/multi-line.gif "Multi Line Examples")

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

**Keybinding Examples and Suggestions:**

```json
  { "key": "meta+/",     "command": "extension.awarestAlignFirst", "args": "//" },
  { "key": "meta+;",     "command": "extension.awarestAlignFirst", "args": ": " },
  { "key": "meta+space", "command": "extension.awarestAlignEach",  "args": " "  },
  { "key": "meta+,",     "command": "extension.awarestAlignList",  "args": ","  },
  { "key": "meta+enter", "command": "extension.awarestAlignLines", "args": " "  },
```

**Note:** The `meta` key is also known as the Windows Key or Command (⌘) on MacOS

## Assumptions

It keeps things simplier for everyone if some general assumptions work for the vast majority of
people by reducing configuration and any code complexity. If any of these don't work in your
situation, please open a quick issue on GitHub as they are mostly pretty straight forward to
update or handle through a configuration option if people actually need something different.

**Linebreaks** - Any insertion of line breaks use the Linux style End of Line (`\n` aka `LF`),
but this could be an issue for Windows style End of Line (`\r\n` aka `CRLF`).

**Tabs** - Tabs are expected to be two spaces. Indentation preserving could be an issue if you
use real "tabs" instead of tabs being converted to spaces. Also, the two spaces are used when
indenting the items of a list being transposed.

## Known Issues

* Multi Cursor Selections - only really handles the first cursor's selected area
* Preserving Spacing in Quoted Strings - currently does not handle quoted strings differently
* Escape Character/Symbol Support - i.e. currently isn't a way to ignore a comma inside quotes
* Partial Line Selections - if part of a line is selected, the entire line is always impacted
* Default Keybindings - (removing) seems there may be some keybinding conflicts on other OSes

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
[GitHub]: https://github.com/awarest/vscode-awarest-align
[issue]: https://github.com/awarest/vscode-awarest-align/issues
[package.json]: https://github.com/awarest/vscode-awarest-align/blob/master/package.json
[src/extension.ts]: https://github.com/awarest/vscode-awarest-align/blob/master/src/extension.ts
[randy3k/AlignTab]: https://github.com/randy3k/AlignTab
[annsk/vscode-alignment]: https://github.com/annsk/vscode-alignment

## Release Notes

---

### 1.0.1 - (2018-01-08)

* Major rewrite, new functionality, updates, and breaking changes
* Removed automatically included keybindings due to OS conflicts
* Greatly expanded the readme, usage info, and example screenshots
* This updated README.md should serve as the initial release notes

---

### 0.4.0 - (and older)

* Release notes were not tracked in detail.
