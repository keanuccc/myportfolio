'use client';

import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
}: MarkdownEditorProps) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setColorMode(isDark ? 'dark' : 'light');

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark');
      setColorMode(dark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="markdown-editor rounded-xl overflow-hidden border border-marrsgreen/15 dark:border-carrigreen/15" data-color-mode={colorMode}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="live"
        height={400}
      />
    </div>
  );
}
