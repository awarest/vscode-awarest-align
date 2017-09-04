'use strict';
import * as vscode from 'vscode';

class Align {

  basic () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
  }

  whitespace () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    editor.selections.forEach((selection) => {
      // if we have anything selelected on the final line, make the end be the beginning
      // of the line after the last real thing we had selected
      let endLine = selection.end.line + ((selection.end.character > 0) ? 1 : 0);
      if (endLine == selection.start.line) { endLine = endLine + 1; }

      // selection's range is the start of any line we have something selected on
      // all the way through to the start of the line after anything "real" selected
      let range = new vscode.Range(selection.start.line, 0, endLine, 0);

      let lines:   string[]   = []; // the finished up lines of text before updating the editor
      let indent:  number     = 0;  // maximum indentation of the selection for use on each line
      let lengths: number[]   = []; // indexed array of lengths of words in word position order
      let words:   string[][] = []; // double array, first layer is the line, second is each word

      // loop over each line, cleaning up the actual line and splitting into words
      editor.document.getText(range).split(/\r\n|\r|\n/).forEach((line) => {
        // look for the largest indent so we can replace it later
        indent = Math.max(0, indent, line.search(/\S/));
        // trim leading/trailing spaces and de-dupe any repeating spaces
        line = line.trim().replace(/\s{2,}/g, ' ');
        // further split our words for each line
        words.push(line.split(/\s/));
      });

      // loops on our temporary "lines" and captures the max
      // length of however many words there happens to be
      words.forEach((line) => {
        line.forEach((word, w) => {
          if (!lengths || !lengths[w]) { lengths.push(0); }
          lengths[w] = Math.max(0, lengths[w], word.length);
        });
      });

      words.forEach((line) => {
        // if the line or first word is blank, just push an empty string and skip
        if (!line || !line[0]) {
          lines.push('');
          return;
        }
        line.forEach((word, w) => {
          // the word should be the original plus any spaces needed to make it
          // end up being the same length as the longest word in that position
          line[w] = word + ' '.repeat(Math.max(0, lengths[w] - word.length));
        });
        // push the padding onto each line then join the words of the line
        // separated by a space, but trimmed to be sure we don't have a tail
        lines.push(' '.repeat(indent) + (line.join(' ')).trim());
      });

      // actually write the lines back into the editor for each selection
      editor.edit((editBuilder) => {
        editBuilder.replace(range, lines.join('\n'));
      });
    });
  }


}



export function activate (context: vscode.ExtensionContext) {
  const align = new Align();

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.awarestAlignBasic', () => {
      align.basic();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.awarestAlignWhitespace', () => {
      align.whitespace();
    })
  );

}


// this method is called when your extension is deactivated
export function deactivate() {}

