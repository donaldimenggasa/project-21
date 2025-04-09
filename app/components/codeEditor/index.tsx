import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { lintKeymap } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  showLineNumbers?: boolean;
  syntaxType?: 'javascript' | 'json' | 'sql';
  showSuggestions?: boolean;
  showBottomTooltip?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  showLineNumbers = true,
  syntaxType = 'javascript',
  showSuggestions = true,
  showBottomTooltip = true,
  className = '',
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

  useEffect(() => {
    if (!editorRef.current) return;

    // Get language support based on syntax type
    const getLanguageSupport = () => {
      switch (syntaxType) {
        case 'json':
          return json();
        case 'sql':
          return sql();
        case 'javascript':
        default:
          return javascript();
      }
    };

    // Base extensions
    const extensions = [
      history(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSpecialChars(),
      highlightSelectionMatches(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...closeBracketsKeymap,
        ...searchKeymap,
        ...lintKeymap,
      ]),
      getLanguageSupport(),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
    ];

    // Optional extensions
    if (showLineNumbers) {
      extensions.push(
        lineNumbers(),
        highlightActiveLineGutter(),
      );
    }

    if (showSuggestions) {
      extensions.push(
        foldGutter(),
        EditorState.allowMultipleSelections.of(true),
      );
    }

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions,
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [syntaxType]); // Only recreate editor when syntax type changes

  // Update editor content when value prop changes
  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value
        }
      });
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={editorRef} 
        className="overflow-hidden bg-gray-900"
      />
      
    </div>
  );
}