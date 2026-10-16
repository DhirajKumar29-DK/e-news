'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline,
  List, ListOrdered, Quote, Link as LinkIcon, Unlink,
  Undo2, Redo2, RemoveFormatting,
  Maximize2, Minimize2, X, Heading2, Heading3, Pilcrow,
  Palette, ChevronDown, Check
} from 'lucide-react';

const COLOR_PALETTE = [
  { name: 'Dark Slate', value: '#0f172a' },
  { name: 'Jagran Red', value: '#dc2626' },
  { name: 'Ocean Blue', value: '#2563eb' },
  { name: 'Emerald Green', value: '#16a34a' },
  { name: 'Amber Orange', value: '#ea580c' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Rose Pink', value: '#e11d48' },
  { name: 'Muted Gray', value: '#64748b' }
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label = 'Story Content',
  placeholder = 'Write the complete news story here... Use H2/H3 for subheadings, bullet points for facts, quotes for statements.'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const modalEditorRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);
  const [tweetInput, setTweetInput] = useState('');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#0f172a');
  const savedRangeRef = useRef<Range | null>(null);

  // Active state trackers for buttons
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
    h2: false,
    h3: false,
    p: false,
    blockquote: false
  });

  const updateActiveStates = useCallback(() => {
    if (typeof document === 'undefined') return;
    try {
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const ul = document.queryCommandState('insertUnorderedList');
      const ol = document.queryCommandState('insertOrderedList');
      
      const blockValue = (document.queryCommandValue('formatBlock') || '').toLowerCase();
      const h2 = blockValue === 'h2' || blockValue.includes('h2');
      const h3 = blockValue === 'h3' || blockValue.includes('h3');
      const p = blockValue === 'p' || blockValue.includes('p');
      const blockquote = blockValue === 'blockquote' || blockValue.includes('blockquote');

      setActiveFormats({
        bold,
        italic,
        underline,
        ul,
        ol,
        h2,
        h3,
        p,
        blockquote
      });
    } catch {
      // Ignore if document selection is empty
    }
  }, []);

  // Synchronize editor content when value is initialized or updated externally
  useEffect(() => {
    if (!editorRef.current) return;
    if (isFirstLoad.current) {
      if (value) {
        editorRef.current.innerHTML = value;
        isFirstLoad.current = false;
      }
      return;
    }
    // External synchronization (e.g. article loaded in edit mode or form reset)
    if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Synchronize modal editor with current content when opening fullscreen
  useEffect(() => {
    if (isFullscreen && modalEditorRef.current) {
      modalEditorRef.current.innerHTML = editorRef.current ? editorRef.current.innerHTML : value;
    }
  }, [isFullscreen, value]);

  const handleInput = () => {
    const targetRef = isFullscreen ? modalEditorRef : editorRef;
    if (targetRef.current) {
      const html = targetRef.current.innerHTML;
      // If user clears everything, don't leave rogue <br>
      const cleanVal = html === '<p><br></p>' || html === '<br>' ? '' : html;
      onChange(cleanVal);
      // Sync other editor
      if (isFullscreen && editorRef.current) {
        editorRef.current.innerHTML = cleanVal;
      } else if (!isFullscreen && modalEditorRef.current) {
        modalEditorRef.current.innerHTML = cleanVal;
      }
      updateActiveStates();
    }
  };

  const saveCurrentSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0);
    }
  };

  const handleSelectionSave = () => {
    saveCurrentSelection();
    updateActiveStates();
  };

  const restoreSelection = () => {
    if (savedRangeRef.current && typeof window !== 'undefined') {
      try {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      } catch {}
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (!target.innerHTML || target.innerHTML === '<br>' || target.innerHTML.trim() === '') {
      target.innerHTML = '<p><br></p>';
      const sel = window.getSelection();
      const range = document.createRange();
      if (target.firstChild) {
        range.setStart(target.firstChild, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
    saveCurrentSelection();
    updateActiveStates();
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.innerHTML === '<p><br></p>' || target.innerHTML === '<br>') {
      target.innerHTML = '';
      onChange('');
    }
  };

  const placeCaretAtEnd = (container: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel) return;

    container.focus();

    if (!container.innerHTML || container.innerHTML.trim() === '' || container.innerHTML === '<br>') {
      container.innerHTML = '<p><br></p>';
    }

    // Find deepest child node (e.g. inside last paragraph)
    let lastEl: Node = container.lastElementChild || container;
    while (lastEl.lastChild && lastEl.lastChild.nodeType === Node.ELEMENT_NODE) {
      lastEl = lastEl.lastChild;
    }

    const range = document.createRange();
    if (lastEl.lastChild && lastEl.lastChild.nodeType === Node.TEXT_NODE) {
      const textNode = lastEl.lastChild;
      range.setStart(textNode, textNode.textContent?.length || 0);
      range.collapse(true);
    } else {
      range.selectNodeContents(lastEl);
      range.collapse(false);
    }

    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range;
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (e.target === target) {
      // Clicked on empty area of editor container
      placeCaretAtEnd(target);
    } else {
      // Clicked directly on a word, line, or paragraph -> keep the exact caret location
      saveCurrentSelection();
    }
    updateActiveStates();
  };

  const getTarget = () => (isFullscreen ? modalEditorRef.current : editorRef.current);

  const execCommand = (cmd: string, val: string | undefined = undefined) => {
    const target = getTarget();
    if (target) {
      target.focus();
      restoreSelection();
    }
    document.execCommand(cmd, false, val);
    handleInput();
    updateActiveStates();
  };

  const handleApplyColor = (color: string) => {
    setCurrentColor(color);
    setIsColorPickerOpen(false);
    const target = getTarget();
    if (target) {
      target.focus();
      restoreSelection();
    }
    document.execCommand('foreColor', false, color);
    handleInput();
    updateActiveStates();
  };

  const formatBlock = (tag: 'p' | 'h2' | 'h3' | 'blockquote') => {
    const target = getTarget();
    if (target) {
      target.focus();
    }
    // Cross-browser formatBlock tag handling
    try {
      document.execCommand('formatBlock', false, `<${tag}>`);
    } catch {
      document.execCommand('formatBlock', false, tag);
    }
    handleInput();
  };

  const handleInsertLink = () => {
    const target = getTarget();
    if (!target) return;

    const selection = window.getSelection();
    let selectedText = '';
    let savedRange: Range | null = null;

    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
      selectedText = selection.toString().trim();
    }

    const url = prompt('Enter link URL (e.g. https://example.com):', 'https://');
    if (!url || url.trim() === '' || url === 'https://') return;

    target.focus();

    if (selection && savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    if (!selectedText) {
      // If no text was selected, insert the link text
      document.execCommand('insertHTML', false, `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${url.trim()}</a>`);
    } else {
      document.execCommand('createLink', false, url.trim());
    }
    handleInput();
  };

  const handleOpenTweetModal = () => {
    // Save exact selection range in editor before modal opens
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
    setTweetInput('');
    setIsTweetModalOpen(true);
  };

  const handleConfirmTweet = () => {
    if (!tweetInput.trim()) {
      setIsTweetModalOpen(false);
      return;
    }

    const raw = tweetInput.trim();
    let cleanUrl = '';

    // Handle full blockquote embed code if user copied it from X
    const hrefMatch = raw.match(/href=["'](https?:\/\/(?:twitter\.com|x\.com)\/[^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      cleanUrl = hrefMatch[1];
    } else if (raw.includes('x.com/') || raw.includes('twitter.com/')) {
      cleanUrl = raw.startsWith('http') ? raw : `https://${raw}`;
    } else {
      alert('Please enter a valid X (Twitter) post link or embed code.');
      return;
    }

    // Clean query params and ensure twitter.com domain for widgets.js compatibility
    try {
      const parsed = new URL(cleanUrl);
      cleanUrl = `https://twitter.com${parsed.pathname}`;
    } catch {
      cleanUrl = cleanUrl.replace(/https?:\/\/x\.com\//i, 'https://twitter.com/');
    }

    const target = getTarget();
    if (target) {
      target.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }

    const tweetHtml = `
      <div class="twitter-tweet-container" contenteditable="false" style="display:flex; justify-content:center; margin:1.5rem 0;">
        <blockquote class="twitter-tweet" data-dnt="true" style="margin:0 auto; max-width:550px;">
          <a href="${cleanUrl}">Loading X Post (${cleanUrl})...</a>
        </blockquote>
      </div>
      <p><br></p>
    `;

    document.execCommand('insertHTML', false, tweetHtml);
    handleInput();
    setIsTweetModalOpen(false);
    setTweetInput('');
  };

  const handleUnlink = () => {
    execCommand('unlink');
  };

  const handleClearFormat = () => {
    execCommand('removeFormat');
  };

  const renderToolbar = () => (
    <div
      className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 select-none text-slate-700"
      onMouseDown={(e) => {
        // Prevent clicking toolbar buttons from stealing focus/selection
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      {/* 1. Headings Group */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => formatBlock('p')}
          className={`h-7 px-2 rounded flex items-center space-x-1 text-xs font-bold transition-colors cursor-pointer ${
            activeFormats.p ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Normal Paragraph"
        >
          <Pilcrow className="w-3 h-3" />
          <span className="hidden sm:inline text-[11px]">Normal</span>
        </button>

        <button
          type="button"
          onClick={() => formatBlock('h2')}
          className={`h-7 px-2 rounded flex items-center space-x-1 text-xs font-black transition-colors cursor-pointer ${
            activeFormats.h2 ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-800'
          }`}
          title="Subheading (H2)"
        >
          <Heading2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">H2</span>
        </button>

        <button
          type="button"
          onClick={() => formatBlock('h3')}
          className={`h-7 px-2 rounded flex items-center space-x-1 text-xs font-black transition-colors cursor-pointer ${
            activeFormats.h3 ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-800'
          }`}
          title="Section Title (H3)"
        >
          <Heading3 className="w-3.5 h-3.5" />
          <span className="text-[11px]">H3</span>
        </button>
      </div>

      <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

      {/* 2. Inline Text Styles (Bold, Italic, Underline) */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.bold ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('italic')}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.italic ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('underline')}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.underline ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              saveCurrentSelection();
              setIsColorPickerOpen(prev => !prev);
            }}
            className="h-7 px-1.5 rounded flex items-center space-x-1 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Text Color (Font Color)"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs font-black leading-none font-serif">A</span>
              <span
                className="w-3.5 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: currentColor }}
              />
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {isColorPickerOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 p-2.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 w-52 space-y-2 animate-in fade-in zoom-in-95 duration-100"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                Choose Text Color
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleApplyColor(c.value)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:scale-110 transition-transform cursor-pointer relative shadow-2xs"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {currentColor === c.value && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-600 cursor-pointer">Custom Color:</label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleApplyColor(e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

      {/* 3. Lists */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.ul ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Bullet Points"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.ol ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

      {/* 4. Quote, Link & 𝕏 Tweet */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => formatBlock('blockquote')}
          className={`h-7 px-2 rounded flex items-center space-x-1 text-xs font-bold transition-colors cursor-pointer ${
            activeFormats.blockquote ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Blockquote (Statement / Quote)"
        >
          <Quote className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Quote</span>
        </button>

        <button
          type="button"
          onClick={handleInsertLink}
          className="h-7 w-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
        </button>

        <button
          type="button"
          onClick={handleOpenTweetModal}
          className="h-7 px-2 rounded flex items-center space-x-1 text-xs font-black bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer"
          title="Embed X (Twitter) Post / Video at Current Cursor Position"
        >
          <span className="font-serif font-black text-xs leading-none">𝕏</span>
          <span className="text-[11px]">Tweet</span>
        </button>
      </div>

      <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

      {/* 6. Undo / Redo / Clear Formats */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => execCommand('undo')}
          className="h-7 w-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => execCommand('redo')}
          className="h-7 w-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleClearFormat}
          className="h-7 w-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7. Fullscreen button (Right Aligned) */}
      <div className="ml-auto flex items-center space-x-1">
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="h-7 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title={isFullscreen ? 'Exit Fullscreen' : 'Open Distraction-Free Fullscreen Editor'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
        {renderToolbar()}

        <div 
          className="relative cursor-text"
          onClick={(e) => {
            if (e.target === e.currentTarget && editorRef.current) {
              placeCaretAtEnd(editorRef.current);
            }
          }}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleEditorClick}
            onKeyUp={handleSelectionSave}
            onMouseUp={handleSelectionSave}
            data-placeholder={placeholder}
            style={{ caretColor: '#0f172a', userSelect: 'text', WebkitUserSelect: 'text' }}
            className="min-h-[220px] max-h-[460px] overflow-y-auto p-4 outline-none text-slate-800 text-sm leading-relaxed cursor-text select-text caret-slate-900 selection:bg-red-100 selection:text-red-900
              empty:before:content-[attr(data-placeholder)] empty:before:absolute empty:before:top-4 empty:before:left-4 empty:before:text-slate-400 empty:before:pointer-events-none empty:before:select-none
              [&>h2]:text-xl [&>h2]:font-black [&>h2]:font-serif [&>h2]:text-slate-900 [&>h2]:mt-4 [&>h2]:mb-2 [&>h2]:border-b [&>h2]:border-slate-100 [&>h2]:pb-1
              [&>h3]:text-base [&>h3]:font-bold [&>h3]:font-serif [&>h3]:text-slate-900 [&>h3]:mt-3 [&>h3]:mb-1.5
              [&>p]:mb-3 [&>p]:leading-relaxed
              [&>blockquote:not(.twitter-tweet)]:border-l-4 [&>blockquote:not(.twitter-tweet)]:border-red-600 [&>blockquote:not(.twitter-tweet)]:pl-4 [&>blockquote:not(.twitter-tweet)]:py-1 [&>blockquote:not(.twitter-tweet)]:italic [&>blockquote:not(.twitter-tweet)]:my-3 [&>blockquote:not(.twitter-tweet)]:text-slate-700 [&>blockquote:not(.twitter-tweet)]:bg-red-50/40 [&>blockquote:not(.twitter-tweet)]:rounded-r
              [&_.twitter-tweet-container]:my-4 [&_.twitter-tweet-container]:p-3.5 [&_.twitter-tweet-container]:bg-slate-900 [&_.twitter-tweet-container]:text-white [&_.twitter-tweet-container]:rounded-xl [&_.twitter-tweet-container]:text-xs [&_.twitter-tweet-container]:border [&_.twitter-tweet-container]:border-slate-800 [&_.twitter-tweet-container]:shadow-sm
              [&_.twitter-tweet]:border-0 [&_.twitter-tweet]:p-0 [&_.twitter-tweet]:m-0 [&_.twitter-tweet]:text-slate-300
              [&_.twitter-tweet_a]:text-sky-400 [&_.twitter-tweet_a]:underline
              [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ul]:space-y-1.5 [&_ul]:pl-2
              [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_ol]:space-y-1.5 [&_ol]:pl-2
              [&_li]:list-item [&_li]:leading-relaxed
              [&_a]:text-red-600 [&_a]:underline [&_a]:font-medium"
          />
        </div>
      </div>

      {/* Fullscreen Focus Mode Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">{label} • Fullscreen Mode</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Done Editing
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Toolbar */}
            {renderToolbar()}

            {/* Modal Canvas */}
            <div 
              className="flex-1 p-6 sm:p-10 overflow-y-auto bg-slate-100/60 cursor-text"
              onClick={(e) => {
                if (e.target === e.currentTarget && modalEditorRef.current) {
                  modalEditorRef.current.focus();
                }
              }}
            >
              <div 
                className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-xs min-h-[500px] relative cursor-text"
                onClick={() => {
                  if (modalEditorRef.current && document.activeElement !== modalEditorRef.current) {
                    modalEditorRef.current.focus();
                  }
                }}
              >
                <div
                  ref={modalEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInput}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onClick={handleEditorClick}
                  onKeyUp={handleSelectionSave}
                  onMouseUp={handleSelectionSave}
                  data-placeholder={placeholder}
                  style={{ caretColor: '#0f172a', userSelect: 'text', WebkitUserSelect: 'text' }}
                  className="min-h-[460px] outline-none text-slate-800 text-base leading-relaxed cursor-text select-text caret-slate-900 selection:bg-red-100 selection:text-red-900
                    empty:before:content-[attr(data-placeholder)] empty:before:absolute empty:before:top-8 empty:before:left-8 empty:before:text-slate-400 empty:before:pointer-events-none empty:before:select-none
                    [&>h2]:text-2xl [&>h2]:font-black [&>h2]:font-serif [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:border-b [&>h2]:border-slate-100 [&>h2]:pb-1.5
                    [&>h3]:text-lg [&>h3]:font-bold [&>h3]:font-serif [&>h3]:text-slate-900 [&>h3]:mt-4 [&>h3]:mb-2
                    [&>p]:mb-4 [&>p]:leading-relaxed
                    [&>blockquote:not(.twitter-tweet)]:border-l-4 [&>blockquote:not(.twitter-tweet)]:border-red-600 [&>blockquote:not(.twitter-tweet)]:pl-4 [&>blockquote:not(.twitter-tweet)]:py-1.5 [&>blockquote:not(.twitter-tweet)]:italic [&>blockquote:not(.twitter-tweet)]:my-4 [&>blockquote:not(.twitter-tweet)]:text-slate-700 [&>blockquote:not(.twitter-tweet)]:bg-red-50/40 [&>blockquote:not(.twitter-tweet)]:rounded-r
                    [&_.twitter-tweet-container]:my-6 [&_.twitter-tweet-container]:p-4 [&_.twitter-tweet-container]:bg-slate-900 [&_.twitter-tweet-container]:text-white [&_.twitter-tweet-container]:rounded-xl [&_.twitter-tweet-container]:text-xs [&_.twitter-tweet-container]:border [&_.twitter-tweet-container]:border-slate-800 [&_.twitter-tweet-container]:shadow-sm
                    [&_.twitter-tweet]:border-0 [&_.twitter-tweet]:p-0 [&_.twitter-tweet]:m-0 [&_.twitter-tweet]:text-slate-300
                    [&_.twitter-tweet_a]:text-sky-400 [&_.twitter-tweet_a]:underline
                    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3 [&_ul]:space-y-2 [&_ul]:pl-2
                    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3 [&_ol]:space-y-2 [&_ol]:pl-2
                    [&_li]:list-item [&_li]:leading-relaxed
                    [&_a]:text-red-600 [&_a]:underline [&_a]:font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 𝕏 Tweet Insertion Modal */}
      {isTweetModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-serif font-black text-sm">
                  𝕏
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Embed X (Twitter) Post</h4>
                  <p className="text-[11px] text-slate-500">Inserts live tweet & video at your exact cursor spot</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTweetModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                X (Twitter) Post Link or Embed Code:
              </label>
              <textarea
                rows={3}
                autoFocus
                placeholder="Paste post URL e.g. https://x.com/username/status/1234567890 or full embed code"
                value={tweetInput}
                onChange={(e) => setTweetInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
              <p className="text-[10px] text-slate-400">
                Tip: X par Share &gt; Copy Link karke yahan paste kar dein.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTweetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTweet}
                disabled={!tweetInput.trim()}
                className="px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors disabled:opacity-40 flex items-center space-x-1.5 shadow-sm"
              >
                <span>Insert Tweet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
