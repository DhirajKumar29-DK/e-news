'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline,
  List, ListOrdered, Indent, Outdent, Quote, Link as LinkIcon, Sparkles, Paintbrush,
  Table, Maximize2, Minimize2, X, Scaling,
  ChevronDown,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
}

export default function RichTextEditor({ value, onChange, label = 'Rich Text Editor' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const modalEditorRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && isFirstLoad.current && value) {
      editorRef.current.innerHTML = value;
      isFirstLoad.current = false;
    }
  }, [value]);

  // Synchronize modal editor with current content when opening popup
  useEffect(() => {
    if (isFullscreen && modalEditorRef.current) {
      modalEditorRef.current.innerHTML = editorRef.current ? editorRef.current.innerHTML : value;
    }
  }, [isFullscreen, value]);

  // If the value gets cleared, empty the editor
  useEffect(() => {
    if (editorRef.current && !value) {
      editorRef.current.innerHTML = '';
      isFirstLoad.current = true;
    }
  }, [value]);

  const handleInput = () => {
    const targetRef = isFullscreen ? modalEditorRef : editorRef;
    if (targetRef.current) {
      const html = targetRef.current.innerHTML;
      onChange(html);
      // Sync content between inline & modal editor
      if (isFullscreen && editorRef.current) {
        editorRef.current.innerHTML = html;
      }
    }
  };

  const execCmd = (command: string, val: string = '') => {
    const targetRef = isFullscreen ? modalEditorRef : editorRef;
    if (targetRef.current && document.activeElement !== targetRef.current && !targetRef.current.contains(document.activeElement)) {
      targetRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  };

  const clearFormatting = () => {
    const targetRef = isFullscreen ? modalEditorRef : editorRef;
    if (targetRef.current) {
      const plainText = targetRef.current.innerText || targetRef.current.textContent || '';
      targetRef.current.innerHTML = plainText ? `<p>${plainText.replace(/\n/g, '<br/>')}</p>` : '';
      handleInput();
    }
  };

  const clearAllContent = () => {
    if (window.confirm('Are you sure you want to clear all text and content from the editor?')) {
      const targetRef = isFullscreen ? modalEditorRef : editorRef;
      if (targetRef.current) {
        targetRef.current.innerHTML = '';
        handleInput();
      }
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL (e.g., https://example.com):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    const tableWidth = prompt('Table Width (e.g. 100%, 80%, 600px):', '100%');
    if (!rows || !cols) return;

    const numRows = parseInt(rows, 10) || 3;
    const numCols = parseInt(cols, 10) || 3;
    const widthStyle = tableWidth || '100%';

    let tableHtml = `<div style="overflow-x:auto; margin:1rem 0;"><table style="width:${widthStyle}; border-collapse:collapse; margin:0 auto; border:1.5px solid #cbd5e1;" resize="both"><thead><tr style="background:#f1f5f9;">`;
    for (let c = 1; c <= numCols; c++) {
      tableHtml += `<th style="border:1px solid #cbd5e1; padding:10px; text-align:left; font-weight:bold; font-size:12px; resize:horizontal; overflow:auto;">Header ${c}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 1; r <= numRows - 1; r++) {
      tableHtml += '<tr>';
      for (let c = 1; c <= numCols; c++) {
        tableHtml += `<td style="border:1px solid #e2e8f0; padding:10px; font-size:12px; resize:horizontal; overflow:auto;">Cell ${r}-${c}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table></div><p></p>';

    execCmd('insertHTML', tableHtml);
  };

  const setTableWidth = (width: string) => {
    const targetRef = isFullscreen ? modalEditorRef : editorRef;
    if (!targetRef.current) return;
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;
    let node: Node | null = sel.anchorNode;
    while (node && node !== targetRef.current) {
      if (node.nodeName === 'TABLE') {
        (node as HTMLElement).style.width = width;
        handleInput();
        return;
      }
      node = node.parentNode;
    }
    alert('Click inside a table cell first to resize that table.');
  };

  const insertCalloutBox = (type: 'summary' | 'key_feature' | 'info') => {
    let boxHtml = '';
    if (type === 'summary') {
      boxHtml = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 1.25rem; border-radius: 16px; margin: 1rem 0; border-left: 6px solid #f59e0b; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:900; font-size:13px; letter-spacing:0.05em; text-transform:uppercase; color:#f59e0b;">
            📌 Summary Overview
          </div>
          <p style="margin:0; font-size:13px; line-height:1.6; color:#f8fafc;">Write quick executive summary points here...</p>
        </div><p></p>
      `;
    } else if (type === 'key_feature') {
      boxHtml = `
        <div style="background: #fffbf2; border: 1.5px solid #fde68a; border-left: 5px solid #d97706; padding: 1.25rem; border-radius: 14px; margin: 1rem 0;">
          <div style="font-weight: 800; font-size: 13px; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
            ⭐ Key Features & Policy Highlights
          </div>
          <ul style="margin:0; padding-left:1.25rem; font-size:13px; color:#334155;">
            <li>Highlight point 1...</li>
            <li>Highlight point 2...</li>
          </ul>
        </div><p></p>
      `;
    } else {
      boxHtml = `
        <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-left: 5px solid #0284c7; padding: 1.25rem; border-radius: 14px; margin: 1rem 0;">
          <div style="font-weight: 800; font-size: 13px; color: #0369a1; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
            💡 Important Context / Exam Note
          </div>
          <p style="margin:0; font-size:13px; color:#0c4a6e;">Add context note for prelims/mains revision...</p>
        </div><p></p>
      `;
    }
    execCmd('insertHTML', boxHtml);
  };

  const fonts = [
    { name: 'Default Body (Inter)', value: 'var(--font-body), sans-serif' },
    { name: 'Noto Serif (Editorial/Hindi)', value: "'Noto Serif Devanagari', 'Merriweather', Georgia, serif" },
    { name: 'Heading (Plus Jakarta Sans)', value: 'var(--font-heading), sans-serif' },
    { name: 'Serif (Georgia)', value: 'Georgia, serif' },
    { name: 'Monospace (Code)', value: 'monospace' }
  ];

  const colors = [
    { name: 'Default', value: 'inherit' },
    { name: 'Primary Blue', value: '#3b82f6' },
    { name: 'Emerald Green', value: '#10b981' },
    { name: 'Violet Purple', value: '#8b5cf6' },
    { name: 'Amber Yellow', value: '#f59e0b' },
    { name: 'Rose Red', value: '#f43f5e' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Gray', value: '#808080' }
  ];

  const renderToolbarControls = () => (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-2 text-slate-800 dark:text-slate-200 relative select-none">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('bold')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('italic')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('underline')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Underline"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('formatBlock', 'H1')}
        className="rounded px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-black border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('formatBlock', 'H2')}
        className="rounded px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-black border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('formatBlock', 'H3')}
        className="rounded px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-black border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        title="Heading 3"
      >
        H3
      </button>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Alignment Controls */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('justifyLeft')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Align Left"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('justifyCenter')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Align Center"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('justifyRight')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Align Right"
      >
        <AlignRight className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('justifyFull')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Justify Text"
      >
        <AlignJustify className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('insertUnorderedList')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('insertOrderedList')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Numbered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('indent')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        title="Indent / Sub-bullet (Tab)"
      >
        <Indent className="h-3.5 w-3.5 text-indigo-600" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('outdent')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        title="Outdent / Decrease Indent (Shift+Tab)"
      >
        <Outdent className="h-3.5 w-3.5 text-indigo-600" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd('formatBlock', 'BLOCKQUOTE')}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Blockquote"
      >
        <Quote className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      <button
        type="button"
        onClick={insertLink}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Insert Hyperlink"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={insertTable}
        className="rounded p-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px]"
        title="Insert Table"
      >
        <Table className="h-3.5 w-3.5 text-amber-600" />
        <span>+ Table</span>
      </button>

      {/* Table Width Resizer Selector */}
      <div className="flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px]">
        <Scaling className="h-3 w-3 text-amber-600" />
        <span className="font-bold text-amber-700 dark:text-amber-400 uppercase">Width:</span>
        <select
          onChange={(e) => setTableWidth(e.target.value)}
          className="bg-transparent text-[10px] text-amber-900 dark:text-amber-200 outline-none cursor-pointer border-none font-extrabold"
          title="Click inside a table to adjust width"
          defaultValue="100%"
        >
          <option value="100%">Full Width (100%)</option>
          <option value="90%">90% Width</option>
          <option value="80%">80% Width</option>
          <option value="70%">70% Width</option>
          <option value="50%">50% Half Width</option>
          <option value="600px">Fixed 600px</option>
          <option value="800px">Fixed 800px</option>
        </select>
      </div>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Container Component Insertion Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => insertCalloutBox('summary')}
          className="px-2 py-1 bg-slate-900 dark:bg-slate-800 text-amber-400 font-extrabold text-[10px] rounded hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700 shadow-2xs"
          title="Insert Summary Container"
        >
          + Summary Card
        </button>
        <button
          type="button"
          onClick={() => insertCalloutBox('key_feature')}
          className="px-2 py-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded hover:bg-amber-600 transition-colors cursor-pointer border border-amber-600 shadow-2xs"
          title="Insert Highlight Container"
        >
          + Key Features
        </button>
        <button
          type="button"
          onClick={() => insertCalloutBox('info')}
          className="px-2 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] rounded hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800 shadow-2xs"
          title="Insert Info Callout"
        >
          + Note Box
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      <button
        type="button"
        onClick={clearFormatting}
        className="rounded p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
        title="Strip all styles and tags while keeping your text"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span>Clear Styles</span>
      </button>

      <button
        type="button"
        onClick={clearAllContent}
        className="rounded px-2 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors cursor-pointer text-[10px] font-extrabold"
        title="Empty entire editor content"
      >
        Clear All
      </button>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Font Family Selector */}
      <div className="flex items-center gap-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Font:</span>
        <select
          onChange={(e) => execCmd('fontName', e.target.value)}
          className="bg-transparent text-[10px] text-slate-700 dark:text-slate-200 outline-none cursor-pointer border-none font-bold"
          title="Font Style"
          defaultValue="var(--font-body), sans-serif"
        >
          {fonts.map((f) => (
            <option key={f.value} value={f.value} className="text-slate-800 dark:text-white bg-white dark:bg-slate-900">
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Text Color Picker */}
      <div className="flex items-center gap-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5">
        <Paintbrush className="h-3 w-3 text-slate-400" />
        <select
          onChange={(e) => execCmd('foreColor', e.target.value)}
          className="bg-transparent text-[10px] text-slate-700 dark:text-slate-200 outline-none cursor-pointer border-none font-bold"
          title="Text Color"
          defaultValue="inherit"
        >
          {colors.map((c) => (
            <option key={c.value} value={c.value} className="text-slate-800 dark:text-white bg-white dark:bg-slate-900" style={{ color: c.value === 'inherit' ? 'currentColor' : c.value }}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Selector */}
      <div className="flex items-center gap-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5">
        <Type className="h-3 w-3 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase">Size:</span>
        <select
          onChange={(e) => execCmd('fontSize', e.target.value)}
          className="bg-transparent text-[10px] text-slate-700 dark:text-slate-200 outline-none cursor-pointer border-none font-bold"
          title="Font Size"
          defaultValue="3"
        >
          <option value="1">10px (XS)</option>
          <option value="2">12px (Small)</option>
          <option value="3">14px (Normal)</option>
          <option value="4">16px (Medium)</option>
          <option value="5">18px (Large)</option>
          <option value="6">24px (XL)</option>
          <option value="7">32px (XXL)</option>
        </select>
      </div>

      {/* Highlighter Picker */}
      <div className="flex items-center gap-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5">
        <Highlighter className="h-3 w-3 text-amber-500" />
        <select
          onChange={(e) => {
            if (e.target.value === 'none') {
              execCmd('removeFormat');
            } else {
              execCmd('hiliteColor', e.target.value);
            }
          }}
          className="bg-transparent text-[10px] text-slate-700 dark:text-slate-200 outline-none cursor-pointer border-none font-bold"
          title="Highlight Color"
          defaultValue=""
        >
          <option value="" disabled>Highlight</option>
          <option value="#fef08a">🟡 Yellow (पीला)</option>
          <option value="#bbf7d0">🟢 Green (हरा)</option>
          <option value="#a5f3fc">🔵 Cyan (नीला)</option>
          <option value="#fed7aa">🟠 Orange (नारंगी)</option>
          <option value="#fecdd3">🔴 Rose (गुलाबी)</option>
          <option value="none">✕ Remove (हटाएं)</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase rounded-lg shadow-xs transition-all cursor-pointer"
          title="Expand editor to full-screen popup view"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Exit Popup</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Full-Screen Popup Editor ↗</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Inline Compact View */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/40">
        {renderToolbarControls()}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              if (e.shiftKey) {
                execCmd('outdent');
              } else {
                execCmd('indent');
              }
            }
          }}
          className="min-h-[220px] max-h-[380px] overflow-y-auto bg-white dark:bg-slate-900 p-4 outline-none text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-relaxed prose dark:prose-invert max-w-none focus:outline-none [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:bg-slate-100 [&_th]:dark:bg-slate-800 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-bold [&_td]:p-2.5 [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-slate-800 [&_tr:nth-child(even)]:bg-slate-50/50"
        />
      </div>

      {/* Full Screen Popup View Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-extrabold text-sm">✏️ Full-Screen Canvas</span>
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">{label}</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Done / Save & Close
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Toolbar */}
            {renderToolbarControls()}

            {/* Expanded Editor Content Area */}
            <div className="flex-grow p-8 bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto">
              <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 min-h-[600px] shadow-xs">
                <div
                  ref={modalEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInput}
                  className="min-h-[550px] outline-none text-slate-900 dark:text-white text-sm sm:text-base leading-relaxed prose dark:prose-invert max-w-none focus:outline-none [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:bg-slate-100 [&_th]:dark:bg-slate-800 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_td]:p-3 [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-white/10 [&_tr:nth-child(even)]:bg-slate-50/50 [&_tr:nth-child(even)]:dark:bg-slate-800/30"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
