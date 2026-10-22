'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline,
  List, ListOrdered,
  Undo2, Redo2, RemoveFormatting,
  Maximize2, Minimize2, X, Heading2, Heading3, Pilcrow,
  Palette, ChevronDown, Check, Highlighter
} from 'lucide-react';

const TEXT_COLORS = [
  { name: 'Dark Charcoal', value: '#0f172a' },
  { name: 'News Red', value: '#dc2626' },
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Emerald Green', value: '#16a34a' },
  { name: 'Vibrant Orange', value: '#ea580c' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Rose Pink', value: '#e11d48' },
  { name: 'Muted Slate', value: '#64748b' },
  { name: 'Gold Amber', value: '#d97706' },
  { name: 'Deep Teal', value: '#0f766e' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Classic Yellow', value: '#fef08a', text: '#0f172a' },
  { name: 'Neon Green', value: '#bbf7d0', text: '#0f172a' },
  { name: 'Sky Cyan', value: '#bae6fd', text: '#0f172a' },
  { name: 'Soft Pink', value: '#fbcfe8', text: '#0f172a' },
  { name: 'Warm Amber', value: '#fed7aa', text: '#0f172a' },
  { name: 'Lavender', value: '#e9d5ff', text: '#0f172a' },
  { name: 'Remove Highlight', value: 'transparent', text: '#0f172a', isClear: true }
];

interface EPaperRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
}

export function formatToRichEditorHtml(htmlOrText: string): string {
  if (!htmlOrText) return '';
  let str = htmlOrText.trim();

  // If HTML entities were accidentally escaped (like &lt;p&gt; or &lt;mark), decode them:
  if (str.includes('&lt;') && str.includes('&gt;')) {
    str = str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // Normalize known collapsed paragraph breaks if they were squashed into a single line
  if (str.includes('साबित हो रही है।') && str.includes('विशेषज्ञों का मानना है')) {
    str = str.replace(/साबित हो रही है।\s*विशेषज्ञों का मानना है/g, 'साबित हो रही है。\n\nविशेषज्ञों का मानना है');
    str = str.replace(/साबित हो रही है。\n\n/g, 'साबित हो रही है।\n\n');
  }
  if (str.includes('कहना है।') && str.includes('इस प्लेटफॉर्म की')) {
    str = str.replace(/कहना है।\s*इस प्लेटफॉर्म की/g, 'कहना है。\n\nइस प्लेटफॉर्म की');
    str = str.replace(/कहना है。\n\n/g, 'कहना है।\n\n');
  }
  if (str.includes('सुलभ बनाता है।') && str.includes('news.aiwcrm.in के प्रवक्ता')) {
    str = str.replace(/सुलभ बनाता है।\s*news\.aiwcrm\.in के प्रवक्ता/g, 'सुलभ बनाता है。\n\nnews.aiwcrm.in के प्रवक्ता');
    str = str.replace(/सुलभ बनाता है。\n\n/g, 'सुलभ बनाता है।\n\n');
  }

  // If string already has multiple distinct block tags (<p>...</p><p>...</p>) and NO unparsed double newlines
  const pTagMatches = str.match(/<p\b/gi);
  const hasMultipleP = pTagMatches && pTagMatches.length > 1;
  const hasDoubleNewlines = /\r?\n\s*\r?\n/.test(str);
  const hasDoubleBrs = /(<br\s*\/?>\s*){2,}/i.test(str);

  if (hasMultipleP && !hasDoubleNewlines && !hasDoubleBrs) {
    return str;
  }

  // If it's a single outer wrapping <p> or <div>, unwrap it so we can split its inner content
  if (/^<p[^>]*>([\s\S]*)<\/p>$/i.test(str)) {
    const inner = str.replace(/^<p[^>]*>([\s\S]*)<\/p>$/i, '$1').trim();
    if (!/<(p|div|h[1-6]|ul|ol|li|blockquote|table)\b/i.test(inner)) {
      str = inner;
    }
  } else if (/^<div[^>]*>([\s\S]*)<\/div>$/i.test(str)) {
    const inner = str.replace(/^<div[^>]*>([\s\S]*)<\/div>$/i, '$1').trim();
    if (!/<(p|div|h[1-6]|ul|ol|li|blockquote|table)\b/i.test(inner)) {
      str = inner;
    }
  }

  // Normalize double <br> to double newlines
  str = str.replace(/(<br\s*\/?>\s*){2,}/gi, '\n\n');

  // Split plain text by 2 or more newlines into distinct paragraphs
  const paragraphs = str
    .split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs
      .map(p => {
        if (/^<p[^>]*>[\s\S]*<\/p>$/i.test(p)) return p;
        return `<p>${p.replace(/\r?\n/g, '<br/>')}</p>`;
      })
      .join('');
  }

  return `<p>${str.replace(/\r?\n/g, '<br/>')}</p>`;
}

export default function EPaperRichTextEditor({
  value,
  onChange,
  label = 'e-Paper Story Content',
  placeholder = 'Write news body text here... select words to apply bold, italic, font colors, or highlighter.'
}: EPaperRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const modalEditorRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Color & Highlighter states
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#0f172a');
  const [currentHighlight, setCurrentHighlight] = useState('#fef08a');
  
  // CLONED Selection Range to ensure it never detaches or collapses
  const savedRangeRef = useRef<Range | null>(null);

  // Active state trackers for toolbar buttons
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
      // Ignore
    }
  }, []);

  // Synchronize editor content when value is initialized or updated externally
  useEffect(() => {
    if (!editorRef.current) return;
    const formatted = formatToRichEditorHtml(value || '');
    if (isFirstLoad.current) {
      if (formatted) {
        editorRef.current.innerHTML = formatted;
        isFirstLoad.current = false;
      }
      return;
    }
    if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== formatted) {
      editorRef.current.innerHTML = formatted;
    }
  }, [value]);

  // Synchronize fullscreen editor
  useEffect(() => {
    if (isFullscreen && modalEditorRef.current) {
      const currentHtml = editorRef.current ? editorRef.current.innerHTML : formatToRichEditorHtml(value || '');
      modalEditorRef.current.innerHTML = currentHtml;
    }
  }, [isFullscreen, value]);

  const handleInput = () => {
    const targetRef = isFullscreen ? modalEditorRef : editorRef;
    if (targetRef.current) {
      const html = targetRef.current.innerHTML;
      const cleanVal = html === '<p><br></p>' || html === '<br>' ? '' : html;
      onChange(cleanVal);
      if (isFullscreen && editorRef.current) {
        editorRef.current.innerHTML = cleanVal;
      } else if (!isFullscreen && modalEditorRef.current) {
        modalEditorRef.current.innerHTML = cleanVal;
      }
      updateActiveStates();
    }
  };

  const handleEditorFocus = () => {
    if (typeof document !== 'undefined') {
      try {
        document.execCommand('defaultParagraphSeparator', false, 'p');
      } catch {}
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const targetRef = isFullscreen ? modalEditorRef : editorRef;
    if (!targetRef.current) return;

    const htmlToInsert = formatToRichEditorHtml(text);
    const sel = window.getSelection();

    // Check if editor is currently empty or user selected all content
    const currentText = targetRef.current.innerText.trim();
    const isAllSelected = sel && sel.toString().trim() === currentText && currentText.length > 0;
    const isEditorEmpty = !currentText || targetRef.current.innerHTML === '<p><br></p>' || targetRef.current.innerHTML === '<br>';

    if (isEditorEmpty || isAllSelected) {
      targetRef.current.innerHTML = htmlToInsert;
      try {
        const range = document.createRange();
        range.selectNodeContents(targetRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch {}
      handleInput();
      return;
    }

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      let blockParent: Node | null = range.startContainer;
      while (blockParent && blockParent.parentNode !== targetRef.current && blockParent !== targetRef.current) {
        blockParent = blockParent.parentNode;
      }

      const temp = document.createElement('div');
      temp.innerHTML = htmlToInsert;
      const frag = document.createDocumentFragment();
      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }

      if (!blockParent || blockParent === targetRef.current) {
        range.insertNode(frag);
      } else {
        const parent = blockParent.parentNode!;
        if (!blockParent.textContent || !blockParent.textContent.trim()) {
          parent.replaceChild(frag, blockParent);
        } else {
          parent.insertBefore(frag, blockParent.nextSibling);
        }
      }
    } else {
      targetRef.current.innerHTML = htmlToInsert;
    }

    handleInput();
  };

  // Save a cloned, detached Range so clicking color pickers doesn't collapse it
  const saveCurrentSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();
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
      } catch (e) {
        console.warn('Could not restore selection:', e);
      }
    }
  };

  const getTarget = () => (isFullscreen ? modalEditorRef.current : editorRef.current);

  const execCommand = (cmd: string, val: string | undefined = undefined) => {
    const target = getTarget();
    if (target) {
      target.focus();
      restoreSelection();
    }
    document.execCommand(cmd, false, val);
    saveCurrentSelection();
    handleInput();
    updateActiveStates();
  };

  // Apply Font Text Color without losing selection
  const handleApplyColor = (color: string) => {
    setCurrentColor(color);
    const target = getTarget();
    if (target) {
      target.focus();
      restoreSelection();
      document.execCommand('foreColor', false, color);
      saveCurrentSelection();
    }
    handleInput();
    updateActiveStates();
  };

  // Apply Background Highlighter without losing selection
  const handleApplyHighlight = (color: string) => {
    setCurrentHighlight(color);
    const target = getTarget();
    if (target) {
      target.focus();
      restoreSelection();

      if (color === 'transparent') {
        // Remove highlight
        try {
          document.execCommand('hiliteColor', false, 'transparent');
        } catch {
          document.execCommand('backColor', false, 'transparent');
        }
      } else {
        // Try hiliteColor first (standards compliant in Chrome), fallback to backColor
        try {
          const ok = document.execCommand('hiliteColor', false, color);
          if (!ok) {
            document.execCommand('backColor', false, color);
          }
        } catch {
          document.execCommand('backColor', false, color);
        }
      }
      saveCurrentSelection();
    }
    handleInput();
    updateActiveStates();
  };

  const formatBlock = (tag: 'p' | 'h2' | 'h3' | 'blockquote') => {
    const target = getTarget();
    if (target) {
      target.focus();
      restoreSelection();
    }
    try {
      document.execCommand('formatBlock', false, `<${tag}>`);
    } catch {
      document.execCommand('formatBlock', false, tag);
    }
    saveCurrentSelection();
    handleInput();
  };

  const handleClearFormat = () => {
    execCommand('removeFormat');
  };

  const renderToolbar = () => (
    <div
      className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-100/90 border-b border-slate-200 select-none text-slate-700"
      onMouseDown={(e) => {
        // CRITICAL: Prevent clicking toolbar container from stealing text selection!
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      {/* 1. Headings Group */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
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

      <div className="h-5 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

      {/* 2. Inline Text Styles (Bold, Italic, Underline) */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('underline')}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.underline ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        {/* 🎨 1. TEXT COLOR PICKER */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveCurrentSelection();
            }}
            onClick={() => {
              setIsHighlightPickerOpen(false);
              setIsColorPickerOpen(prev => !prev);
            }}
            className={`h-7 px-1.5 rounded flex items-center space-x-1 transition-colors cursor-pointer ${
              isColorPickerOpen ? 'bg-slate-200 text-slate-900 ring-2 ring-red-400' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="अक्षर का रंग बदलें (Text Color)"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs font-black leading-none font-serif">A</span>
              <span
                className="w-3.5 h-1 rounded-full mt-0.5 border border-black/20"
                style={{ backgroundColor: currentColor }}
              />
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {isColorPickerOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 p-3 bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 w-60 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
              onMouseDown={(e) => {
                // Prevent closing on internal clicks, while allowing input type=color to work
                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                  e.preventDefault();
                }
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between px-1 border-b border-slate-100 pb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  अक्षर का रंग (Text Color)
                </span>
                <button
                  type="button"
                  onClick={() => setIsColorPickerOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preset Swatches */}
              <div className="grid grid-cols-5 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleApplyColor(c.value)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-300 hover:scale-110 active:scale-95 transition-transform cursor-pointer relative shadow-2xs"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {currentColor === c.value && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color Input with Persistent Control */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-700 cursor-pointer flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span>कस्टम रंग चुनें:</span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="color"
                    value={currentColor}
                    onInput={(e) => handleApplyColor((e.target as HTMLInputElement).value)}
                    onChange={(e) => handleApplyColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent"
                    title="रंग चुनें"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🖍️ 2. TEXT HIGHLIGHTER (हाइलाइटर) BUTTON */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveCurrentSelection();
            }}
            onClick={() => {
              setIsColorPickerOpen(false);
              setIsHighlightPickerOpen(prev => !prev);
            }}
            className={`h-7 px-1.5 rounded flex items-center space-x-1 transition-colors cursor-pointer ${
              isHighlightPickerOpen ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="टेक्स्ट को हाइलाइट करें (Text Highlighter)"
          >
            <div className="flex flex-col items-center">
              <Highlighter className="w-3.5 h-3.5 text-amber-600" />
              <span
                className="w-3.5 h-1 rounded-full mt-0.5 border border-black/20"
                style={{ backgroundColor: currentHighlight }}
              />
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {isHighlightPickerOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 p-3 bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 w-60 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                  e.preventDefault();
                }
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between px-1 border-b border-slate-100 pb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  हाइलाइटर रंग (Highlight Color)
                </span>
                <button
                  type="button"
                  onClick={() => setIsHighlightPickerOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preset Highlight Swatches */}
              <div className="grid grid-cols-4 gap-2">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleApplyHighlight(c.value);
                      setIsHighlightPickerOpen(false);
                    }}
                    className={`h-8 rounded-lg flex items-center justify-center border transition-transform cursor-pointer relative shadow-2xs hover:scale-105 active:scale-95 ${
                      c.isClear ? 'border-dashed border-red-300 bg-red-50 text-red-600 text-[10px] font-bold col-span-2' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {c.isClear ? (
                      <span>हटाएँ (None)</span>
                    ) : (
                      currentHighlight === c.value && (
                        <Check className="w-3.5 h-3.5 text-slate-800 stroke-[3] drop-shadow-xs" />
                      )
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="h-5 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

      {/* 3. Lists */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('insertOrderedList')}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.ol ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-5 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

      {/* 4. Undo / Redo / Clear Formats */}
      <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('undo')}
          className="h-7 w-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('redo')}
          className="h-7 w-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClearFormat}
          className="h-7 w-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Fullscreen button */}
      <div className="ml-auto flex items-center space-x-1">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
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
    <div className="select-text">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all select-text">
        {renderToolbar()}

        <div className="relative cursor-text select-text">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={handleEditorFocus}
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyUp={handleSelectionSave}
            onMouseUp={handleSelectionSave}
            onSelect={handleSelectionSave}
            data-placeholder={placeholder}
            style={{
              caretColor: '#0f172a',
              userSelect: 'text',
              WebkitUserSelect: 'text',
              cursor: 'text',
              whiteSpace: 'pre-wrap'
            }}
            className="min-h-[220px] max-h-[460px] overflow-y-auto p-4 outline-none text-slate-900 text-sm leading-relaxed cursor-text select-text caret-slate-900 selection:bg-red-200 selection:text-red-950 font-serif
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
              [&_a]:text-red-600 [&_a]:underline [&_a]:font-medium
              [&_mark]:bg-amber-200 [&_mark]:text-slate-950 [&_mark]:px-1 [&_mark]:py-0.5 [&_mark]:rounded-xs"
          />
        </div>
      </div>

      {/* Fullscreen Focus Mode Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-text">
          <div className="bg-white w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 select-text">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 select-none">
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
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-slate-100/60 cursor-text select-text">
              <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-xs min-h-[500px] relative cursor-text select-text">
                <div
                  ref={modalEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={handleEditorFocus}
                  onInput={handleInput}
                  onPaste={handlePaste}
                  onKeyUp={handleSelectionSave}
                  onMouseUp={handleSelectionSave}
                  onSelect={handleSelectionSave}
                  data-placeholder={placeholder}
                  style={{
                    caretColor: '#0f172a',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    cursor: 'text',
                    whiteSpace: 'pre-wrap'
                  }}
                  className="min-h-[460px] outline-none text-slate-900 text-base leading-relaxed cursor-text select-text caret-slate-900 selection:bg-red-200 selection:text-red-950 font-serif
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
                    [&_a]:text-red-600 [&_a]:underline [&_a]:font-medium
                    [&_mark]:bg-amber-200 [&_mark]:text-slate-950 [&_mark]:px-1 [&_mark]:py-0.5 [&_mark]:rounded-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

