import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import '@teamdigitale/schema-editor/dist/style.css';
import { useState, useEffect } from 'react';
import { Editor } from './components/editor/editor';
import { Layout } from './components/layout/layout';
import { ConfigurationProvider } from './features/configuration';
import { CommandPalette } from './components/command-palette/command-palette';

function App() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectUrl = (url: string) => {
    // Navigate to the selected schema URL
    window.location.href = `?url=${encodeURIComponent(url)}`;
  };

  return (
    <ConfigurationProvider>
      <Layout>
        <Editor />
      </Layout>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectUrl={handleSelectUrl}
      />
    </ConfigurationProvider>
  );
}

export default App;
