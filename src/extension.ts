'use strict'
import * as vscode from 'vscode'

const EMPTY = ''
const SPACE = ' '

const LINEBREAK  = /\r\n|\r|\n/
const WHITESPACE = '\\s'

const NON_QUOTED_SPACES = /[^\s"]*"([^"]*)"|[^\s']*'([^']*)'|[^\s"']+/g

const SPACE_CLOSE_ANGLE       = /\s\>/g   // finds all " >"  values in a string
const SPACE_SLASH_CLOSE_ANGLE = /\s\/\>/g // finds all " />" values in a string


class Awarest {

  static transpose (separator: string, list: boolean, html: boolean = false) {
    const editor = vscode.window.activeTextEditor
    if (!editor || !separator) { return }

    const CONFIG = vscode.workspace.getConfiguration('awarestAlign', editor.document.uri)
    const TAB = CONFIG.get('tab') + ''
    const EOL = CONFIG.get('eol') + ''

    // find our range definition and our actual selected text
    let range = Awarest.getRange(editor.selections[0])
    let text = editor.document.getText(range)

    // container variables used in either code path
    let lines: string[] = []    // container for our split lines
    let final: string   = EMPTY // container for the final output text

    // finds the largest indentation of any of our "selected" lines
    let indent = SPACE.repeat(Awarest.getIndent(text))

    // now that we know the indent, we actually want our text trimmed and we will
    // add the indent back to the one line or each line when we are all done
    text = text.trim()

    // if we only have one line, we must want to split it into multiple lines
    if (Awarest.isOneLine(range)) {
      // get rid of any repeating separators so we don't get extra blank lines
      text = Awarest.dedupe(text, separator)

      // we will end up with one line for each time the separator was found
      // added separate handling depending on if we are doing html or not
      lines = (html ? text.match(NON_QUOTED_SPACES) : text.split(separator))

      // add the separator back to the end of each line, make sure it is trimmed,
      // then we will add the indent back to the start of each line
      lines.forEach((line, index) => {
        // if the line would be blank, we don't want/need a separator or blank spaces
        if (!line.trim()) { return lines[index] = EMPTY }
        // assign the line with extra tab for a list, always with indent, adding the separator
        lines[index] = (list || html ? TAB : EMPTY) + indent + (line + separator).trim()
      })

      if (html) {
        lines[0] = indent + lines[0].trim()
        let last = lines.pop().trim()
        if (last.endsWith('>')) {
          if (last.endsWith('/>')) {
            if (last.length > 2) { lines.push(indent + TAB + last.slice(0, -2)) }
            last = '/>'
          } else {
            if (last.length > 1) { lines.push(indent + TAB + last.slice(0, -1)) }
            last = '>'
          }
        } else {
          last = TAB + last
        }
        lines.push(indent + last)
      }

      // create our final output by joining every line into a string split by newlines
      final = lines.join(EOL)

      // special handling if we are dealing with a list
      if (list) {
        // we will need to reapply our indentation a little differently
        final = final.trim()
        // try to find the first index of a list wrapper and filter for greater than -1
        const opening = Math.min(...[
          final.indexOf('['),
          final.indexOf('{'),
          final.indexOf('('),
        ].filter((value) => value > -1))
        if (opening > -1) {
          final = ''
            + final.slice(0, opening + 1).trim()
            + EOL
            + indent
            + TAB
            + final.slice(opening + 1).trim()
        }
        // a little easier to find the last index of a list wrapper
        const closing = Math.max(...[
          final.lastIndexOf(']'),
          final.lastIndexOf('}'),
          final.lastIndexOf(')'),
        ])
        if (closing > -1) {
          final = ''
            + final.slice(0, closing).trim()
            + separator
            + EOL
            + indent
            + final.slice(closing, -separator.length)
        }
        // add our initial indentation back on
        final = indent + final
      }

    // otherwise we are merging multiple lines into one
    } else {
      // find our lines based on any linebreaks
      lines = text.split(LINEBREAK)
      // make sure each line is trimmed
      lines.forEach((line, index) => {
        // if the line is blank or only spaces, we don't want/need a separator or blank spaces
        if (!line || !line.trim()) { line = EMPTY }
        // if the line ends with the separator, we need to strip it off
        if (line.endsWith(separator)) { line = line.substr(0, line.length - separator.length) }
        // make sure the line is trimmed for anything further
        line = line.trim()
        // we need to recheck if the line now ends with the separator to strip it off
        if (line.endsWith(separator)) { line = line.substr(0, line.length - separator.length) }
        // double check that we are still trimmed and assign back int our array
        lines[index] = line.trim()
      })
      // merge into a single line adding a space between if the option is set
      final = lines.join(separator + (list ? SPACE : EMPTY)).trim()
      // if we are a list, need to strip the first and last instance of the separator
      if (list) {
        let first = final.indexOf(separator)
        if (first > -1) {
          final = final.substring(0, first).trim() + final.substring(first + separator.length)
        }
        let last = final.lastIndexOf(separator)
        if (last > -1) {
          final = final.substring(0, last).trim() + final.substring(last + separator.length)
        }
      }

      if (html) {
        final = final.replace(SPACE_SLASH_CLOSE_ANGLE, '/>')
        final = final.replace(SPACE_CLOSE_ANGLE, '>')
      }

      // trim any whitespace, then add our indent back onto the start
      final = indent + final
    }

    // time to actually write the text back to the editor and adding the
    // final linebreak that got trimmed off in our proccessing
    editor.edit((editBuilder) => { editBuilder.replace(range, final + EOL) })
  }


  static characters (characters: string, first: boolean) {
    const editor = vscode.window.activeTextEditor
    if (!editor || !characters) { return }

    const CONFIG = vscode.workspace.getConfiguration('awarestAlign', editor.document.uri)
    const EOL = CONFIG.get('eol')

    // the joiner between each part, only pad with a space if it isn't already one
    const JOINER = '' + (characters.startsWith(SPACE) ? EMPTY : SPACE) + characters
    const LEADING = new RegExp('[\\s]*[' + characters + ']', 'g')
    const TRAILING = new RegExp('[' + characters + '][\\s]*', 'g')

    editor.selections.forEach((selection) => {
      let range = Awarest.getRange(selection)

      // need to reuse these on each iteration of the main loop, can't redeclare them each time
      let indent:  number     = 0  // maximum indent of the selection, to be used on each line
      let lengths: number[]   = [] // indexed array of lengths of parts in part position order
      let parts:   string[][] = [] // first layer is the line, second is each part/word
      let final:   string[]   = [] // the finished up lines of text before updating the editor
      let cleaned: string     = '' // just a reusable container for a cleaned up line of text

      if (Awarest.isOneLine(range)) {
        let line = editor.document.getText(range)
        indent = Awarest.getIndent(line, indent)
        if (first) {
          // finding the first index
          let index = line.indexOf(characters)
          // splitting by our first instance, trimming, and reassembling everything
          cleaned = EMPTY
            + line.substr(0, index).trim()
            + characters
            + line.substr(index + characters.length).trim()
        } else {
          // finding all the instances of our characters
          let parts = line.trim().split(characters)
          parts.forEach((part, index) => {
            // make sure we strip the characters off and trim both ends
            part = part.replace(characters, EMPTY).trim()
            // add this part as is to the cleaned version if empty or if the last part of the
            // split, otherwise we need to add the characters back to all except the very end
            cleaned += (!part || index === (parts.length - 1) ? part : part + characters)
          })
        }
        // we need to put the indentation and the newline back on that got stripped by trimming
        final = [SPACE.repeat(indent) + cleaned + EOL]
      } else {
        // loop over each line, cleaning up the actual line and splitting into parts
        editor.document.getText(range).split(LINEBREAK).forEach((line) => {
          indent = Awarest.getIndent(line, indent)
          line = line.trim()
          if (first) {
            // find the index and split the string into a before and after and trim both parts
            let index = line.indexOf(characters)
            // if we found our characters, split the string at the first instance, trim both
            // sides, and insert that as our parts, otherwise just insert the line as is
            parts.push(index === -1 ? [line] : [
              line.substr(0, index).trim(),
              line.substr(index + characters.length).trim()
            ])
          } else {
            parts.push((Awarest.getClean(line)).split(characters))
          }
        })

        // loops on our temporary "lines" and captures the max lengths of each part we have
        parts.forEach((line) => {
          line.forEach((part, p) => {
            if (!lengths || !lengths[p]) { lengths.push(0) }
            lengths[p] = Math.max(0, lengths[p], part.length)
          })
        })

        parts.forEach((line) => {
          // if the line or the first and second part are blank, push an empty string and skip
          // checking first/second part accounts for non-whitespace first characters being used
          if (!line || (!line[0] && !line[1])) {
            final.push(EMPTY)
            return
          }
          line.forEach((part, p) => {
            // the word should be the original plus any spaces needed to make it
            // end up being the same length as the longest part in that position
            line[p] = part + SPACE.repeat(Math.max(0, lengths[p] - part.length))
          })
          // push the indent padding onto each line, then join the parts of the line, trim tail
          final.push(SPACE.repeat(indent) + (line.join(JOINER)).trim())
        })
      }

      // actually write the final lines back into the editor for each selection
      editor.edit((editBuilder) => { editBuilder.replace(range, final.join('\n')) })
    })
  }

  private static dedupe (text: string, value: string): string {
    // just an extra safety net that shouldn't be needed
    if (!text || !value) { return text || EMPTY }
    return text.replace(new RegExp('(' + value + ')+', 'g'), value)
  }

  // renmaed this away from isSingleLine so it doesn't imply the meaning of the native property
  /** our special handling check to see if the resulting range is BASICALLY one line */
  private static isOneLine ({ start, end }: vscode.Range): boolean {
    return (start.line === end.line || (end.character === 0 && (start.line === end.line - 1)))
  }

  /** special handling to ignore the trailing line if nothing is actually selected there */
  private static getRange ({ start, end }: vscode.Selection): vscode.Range {
    // if we have anything selelected on the final line, make the end be the
    // beginning of the line after the last real thing we had selected
    let endLine = end.line + ((end.character > 0) ? 1 : 0)
    if (endLine == start.line) { endLine = endLine + 1 }

    // selection's range is the start of any line we have something selected on
    // all the way through to the start of the line after anything "real" selected
    return new vscode.Range(start.line, 0, endLine, 0)
  }

  /** find the largest indent so we can replace it later, based on the optional previous max */
  private static getIndent (text: string = EMPTY, max: number = 0): number {
    return Math.max(0, max, text.search(/\S/))
  }

  /** replace any series of spaces/tabs/linebreaks with a single space and trim */
  private static getClean (text: string = EMPTY): string {
    return text.replace(/[\s]+/g, SPACE).trim()
  }

}


// this method is called when your extension is deactivated, shouldn't be much to cleanup
export function deactivate() {}


// this gets called the first time you trigger one of the events listed in the package.json
// file under activationEvents, basically gets called once per session only IF they use it
export function activate (context: vscode.ExtensionContext) {

  context.subscriptions.push(

    vscode.commands.registerCommand('extension.awarestAlignEach', (characters) => {
      if (!characters) {
        vscode.window.showInputBox({ prompt: 'Each Occurrence:' })
          .then(input => Awarest.characters(input, false))
      }
      Awarest.characters(characters, false)
    }),

    vscode.commands.registerCommand('extension.awarestAlignFirst', (characters) => {
      if (!characters) {
        vscode.window.showInputBox({ prompt: 'First Occurrence:' })
          .then(input => Awarest.characters(input, true))
      }
      Awarest.characters(characters, true)
    }),

    vscode.commands.registerCommand('extension.awarestAlignLines', (separator) => {
      if (!separator) {
        vscode.window.showInputBox({ prompt: 'Transpose Separator:' })
          .then(input => Awarest.transpose(input, false))
      }
      Awarest.transpose(separator, false)
    }),

    vscode.commands.registerCommand('extension.awarestAlignList', (separator) => {
      if (!separator) {
        vscode.window.showInputBox({ prompt: 'List Separator:' })
          .then(input => Awarest.transpose(input, true))
      }
      Awarest.transpose(separator, true)
    }),

    vscode.commands.registerCommand('extension.awarestAlignHtml', (separator) => {
      Awarest.transpose(separator, false, true)
    }),

  )
}
