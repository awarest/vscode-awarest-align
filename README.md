# vscode-awarest-align
Code and syntax alignment helpers for VS Code

This is my very first extension and real open source repository, be gentle...

Heavily inspired by a method of whitespace alignment in Sublime Text 3 when using the AlignTab package (https://github.com/randy3k/AlignTab)

Also referenced and learned from this VS Code extension for alignment (https://github.com/annsk/vscode-alignment)


NOTES - I'm working in a Linux development environment, the linebreaks may not work perfectly for Mac/Windows at the moment. Same with potential hotkey conflicts. If anyone is ACTUALLY interested in or trying to use this, I'll tweak/fix some of that stuff too. Ping me on twitter at @brian_jorden or throw an issue on Github to let me know, otherwise, this is just more convienent for me to publish/pull down for myself.


UPDATE: Added a new bit of functionality to handle linebreaks. The current hotkey defaults to `meta+enter` and the "selection" works the same as the whitespace handler description below. If you have a single line selected, it will split that line into new separate lines based on de-duped spaces/tabs (one new line for any sequence of spaces/tabs). If you have more than one line selected, it will combine them into a single line with any spaces/tabs/linebreaks de-duped. In either situation, the indentation of the first line selected is re-used for the one or all lines.


Current version assumes a hotkey of `meta+space` that works on whole lines of text. What that means is if your cursor is on a single line, it runs for just that line. If you have a couple lines selected, but the cursor is at the very start of a line, it doesn't consider that last line.

When aligning the following steps/logic/pattern is followed:
  * conforms all lines to the same (maximum) indentation
  * de-dupes repeating spaces (except the initial indent)
  * aligns the start of each word by padding the ends of words with spaces
  * strips any trailing spaces from any of the lines

`meta` = Windows Key/MacOS Command (⌘)


TODO - Add some examples/screenshots/recordings
