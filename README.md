# vscode-awarest-align
Code and syntax alignment helpers for VS Code

This is my very first extension and real open source repository, be gentle...

Heavily inspired by a method of whitespace alignment in Sublime Text 3 when using the AlignTab package (https://github.com/randy3k/AlignTab)

Also referenced and learned from this VS Code extension for alignment (https://github.com/annsk/vscode-alignment)


Current version assumes a hotkey of `meta+space` that works on whole lines of text. What that means is if your cursor is on a single line, it runs for just that line. If you have a couple lines selected, but the cursor is at the very start of a line, it doesn't consider that last line.

When aligning the following steps/logic/pattern is followed:
  * conforms all lines to the same (maximum) indentation
  * de-dupes repeating spaces (except the initial indent)
  * aligns the start of each word by padding the ends of words with spaces
  * strips any trailing spaces from any of the lines

`meta` = Windows Key/MacOS Command (⌘)


TODO - Add some examples/screenshots/recordings
