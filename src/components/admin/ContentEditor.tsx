'use client';

import React from 'react';
import { Bold, Italic, Code, SquareSlash, Sparkles, Film, HelpCircle, Save, CheckCircle } from 'lucide-react';

interface ContentEditorProps {
  questionStem: string;
  hintText: string;
  videoUrl: string;
  onChangeQuestionStem: (text: string) => void;
  onChangeHintText: (text: string) => void;
  onChangeVideoUrl: (url: string) => void;

  // Actions
  onSaveDraft: () => void;
  onPublish: () => void;

  // Validation
  isValid: boolean;
  validationErrors: string[];
}

// Bidirectional markdown <-> HTML sync converters for visual WYSIWYG editing
const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  let md = html;
  
  // Convert basic formatting tags
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  
  // Convert layout and blocks
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '\n$1');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean up duplicate newlines and entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&amp;/g, '&');
  
  // Strip any remaining HTML tags to keep it pure markdown
  md = md.replace(/<[^>]+>/g, '');
  
  return md.trim();
};

const markdownToHtml = (md: string): string => {
  if (!md) return '';
  let html = md;
  
  // Escape HTML tags to prevent rendering issues while editing raw markup
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Convert markdown to HTML representation
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([\s\S]*?)`/g, '<code>$1</code>');
  html = html.replace(/\n/g, '<br/>');
  
  return html;
};

export default function ContentEditor({
  questionStem,
  hintText,
  videoUrl,
  onChangeQuestionStem,
  onChangeHintText,
  onChangeVideoUrl,
  onSaveDraft,
  onPublish,
  isValid,
  validationErrors
}: ContentEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [activeFormats, setActiveFormats] = React.useState({
    bold: false,
    italic: false,
    code: false,
    math: false
  });

  const checkActiveFormats = () => {
    const boldActive = document.queryCommandState('bold');
    const italicActive = document.queryCommandState('italic');
    
    let codeActive = false;
    let mathActive = false;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node: Node | null = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'CODE') {
          codeActive = true;
        }
        if (node.nodeName === 'SPAN' && (node as HTMLElement).classList.contains('math-tex')) {
          mathActive = true;
        }
        node = node.parentNode;
      }
    }
    
    setActiveFormats({
      bold: boldActive,
      italic: italicActive,
      code: codeActive,
      math: mathActive
    });
  };

  // Sync state to editor HTML only when editor is NOT focused (external updates, e.g. search select)
  React.useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(questionStem);
    }
  }, [questionStem]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markdown = htmlToMarkdown(html);
      onChangeQuestionStem(markdown);
    }
  };

  const handleBold = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents selection loss
    document.execCommand('bold', false);
    handleInput();
    checkActiveFormats();
  };

  const handleItalic = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents selection loss
    document.execCommand('italic', false);
    handleInput();
    checkActiveFormats();
  };

  const handleCode = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents selection loss
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Check if code is already active to untoggle it
    let codeNode: HTMLElement | null = null;
    let node: Node | null = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'CODE') {
        codeNode = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }
    
    if (codeNode) {
      // Untoggle: unwrap code node
      const parent = codeNode.parentNode;
      if (parent) {
        while (codeNode.firstChild) {
          parent.insertBefore(codeNode.firstChild, codeNode);
        }
        parent.removeChild(codeNode);
      }
    } else {
      // Toggle: wrap in code node
      const selectedText = selection.toString();
      if (selectedText.length === 0) {
        document.execCommand('insertHTML', false, '<code>code</code>');
      } else {
        const range = selection.getRangeAt(0);
        const codeElement = document.createElement('code');
        codeElement.appendChild(range.extractContents());
        range.insertNode(codeElement);
      }
    }
    handleInput();
    checkActiveFormats();
  };

  const handleMath = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents selection loss
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Check if math is already active to untoggle it
    let mathNode: HTMLElement | null = null;
    let node: Node | null = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'SPAN' && (node as HTMLElement).classList.contains('math-tex')) {
        mathNode = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }
    
    if (mathNode) {
      // Untoggle: unwrap math node
      const parent = mathNode.parentNode;
      if (parent) {
        while (mathNode.firstChild) {
          parent.insertBefore(mathNode.firstChild, mathNode);
        }
        parent.removeChild(mathNode);
      }
    } else {
      // Toggle: wrap in math node
      const selectedText = selection.toString();
      const mathElement = document.createElement('span');
      mathElement.className = 'math-tex';
      mathElement.setAttribute('style', "font-family: 'Times New Roman', Times, serif; font-style: italic; color: #2563eb; background-color: #f8fafc; padding: 1px 4px; border: 1px solid #e2e8f0; border-radius: 4px; font-weight: 500;");
      
      const range = selection.getRangeAt(0);
      if (selectedText.length === 0) {
        mathElement.innerText = 'x^2';
        range.insertNode(mathElement);
      } else {
        mathElement.appendChild(range.extractContents());
        range.insertNode(mathElement);
      }
    }
    handleInput();
    checkActiveFormats();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
      {/* Editor Header & Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-2">
          <SquareSlash className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Content Editor</span>
        </div>

        {/* Toolbar formatting buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg">
          <button
            type="button"
            onMouseDown={handleBold}
            title="Bold"
            className={`p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 transition-colors cursor-pointer ${
              activeFormats.bold ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={handleItalic}
            title="Italic"
            className={`p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 transition-colors cursor-pointer ${
              activeFormats.italic ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={handleCode}
            title="Inline Code"
            className={`p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 transition-colors cursor-pointer ${
              activeFormats.code ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={handleMath}
            title="LaTeX Math"
            className={`p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 transition-colors text-xs font-semibold leading-none w-5.5 h-5.5 flex items-center justify-center cursor-pointer ${
              activeFormats.math ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            $$
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-5 space-y-5">
        {/* Question Stem Text Area */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Question Stem (Visual WYSIWYG Editor)
          </label>
          
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onKeyUp={checkActiveFormats}
              onMouseUp={checkActiveFormats}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                handleInput();
              }}
              className="w-full min-h-[14rem] max-h-[16rem] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 overflow-y-auto resize-none leading-relaxed transition-all prose max-w-none focus:bg-white dark:focus:bg-slate-900 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-slate-800 dark:prose-code:text-slate-800 dark:text-slate-200"
              style={{ outline: 'none' }}
            />
            {!questionStem && (
              <div className="absolute top-4 left-4 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 pointer-events-none font-sans max-w-[90%]">
                Type your question prompt, mathematical equations in $...$ or $$...$$, and step-by-step solutions here...
              </div>
            )}
          </div>
        </div>

        {/* Hint Text input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Student Hint (Markdown Support)
          </label>
          <textarea
            value={hintText}
            onChange={(e) => onChangeHintText(e.target.value)}
            placeholder="Enter a helpful tip or prompt suggestion (e.g. Express new price in terms of x)"
            rows={2}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none overflow-y-auto break-words leading-relaxed"
          />
        </div>

        {/* Video solution reference input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            Video Solution Reference (YouTube URL)
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center justify-center w-5 h-5 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <Film className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            </div>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => onChangeVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* Validation Errors Panel */}
        {!isValid && validationErrors.length > 0 && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl flex flex-col gap-1.5 animate-fadeIn">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Validation Warnings
            </span>
            <ul className="list-disc pl-4 space-y-0.5">
              {validationErrors.map((err, index) => (
                <li key={index} className="text-xs text-rose-600 dark:text-rose-400 font-semibold tracking-tight">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Editor Footer / Action Buttons */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
          <span>Save Draft</span>
        </button>

        <button
          type="button"
          onClick={onPublish}
          className={`flex items-center gap-2 px-5 py-2.5 text-slate-900 dark:text-white rounded-lg text-xs font-bold shadow-md transition-all duration-200 ${
            isValid
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 cursor-pointer active:scale-98'
              : 'bg-slate-400 opacity-60 cursor-not-allowed shadow-none'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Publish Question</span>
        </button>
      </div>
    </div>
  );
}
