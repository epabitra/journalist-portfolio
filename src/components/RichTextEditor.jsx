/**
 * Rich Text Editor Component
 * Wrapper around ReactQuill for rich text editing
 * Supports HTML content and is backward compatible with plain text
 * Plain text will be displayed and can be formatted using the toolbar
 */

import { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, error }) => {
  const quillRef = useRef(null);

  // Configure toolbar - comprehensive formatting options
  // Users can format text using: bold, italic, headings, lists, colors, alignment, links, etc.
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Headings (H1, H2, H3, Normal)
      ['bold', 'italic', 'underline', 'strike'], // Text formatting
      [{ 'color': [] }, { 'background': [] }], // Text and background colors
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Ordered and bullet lists
      [{ 'align': [] }], // Text alignment (left, center, right, justify)
      ['link', 'image'], // Insert links and images
      ['blockquote', 'code-block'], // Blockquotes and code blocks
      ['clean'] // Remove all formatting
    ],
  };

  // All formats that are allowed in the editor
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image',
    'blockquote', 'code-block'
  ];

  useEffect(() => {
    // Style the toolbar to match the app's design
    if (quillRef.current && quillRef.current.getEditor) {
      const editor = quillRef.current.getEditor();
      const toolbar = editor.getModule('toolbar');
      
      if (toolbar) {
        toolbar.container.style.borderTopLeftRadius = 'var(--radius-md)';
        toolbar.container.style.borderTopRightRadius = 'var(--radius-md)';
      }
    }
  }, []);

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your content here...'}
        style={{
          minHeight: '400px',
        }}
      />
      {error && <span className="error" style={{ marginTop: 'var(--space-2)', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default RichTextEditor;
