import { useState, useEffect, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, Input } from 'design-react-kit';
import './command-palette.scss';

interface SchemaUrl {
  id: string;
  url: string;
  rawUrl?: string;
}

const SCHEMA_URLS: SchemaUrl[] = [
  {
    id: 'categoria-pensione',
    url: 'https://w3id.org/italia/schemas/categoria-pensione/latest/categoria-pensione.oas3.yaml',
    rawUrl: 'https://raw.githubusercontent.com/INPS-it/NDC/main/assets/schemas/categoria-pensione/latest/categoria-pensione.oas3.yaml',
  },
  {
    id: 'contratto-di-lavoro-domestico',
    url: 'https://w3id.org/italia/schemas/contratto-di-lavoro-domestico/latest/contratto-di-lavoro-domestico.oas3.yaml',
    rawUrl: 'https://raw.githubusercontent.com/INPS-it/NDC/main/assets/schemas/contratto-di-lavoro-domestico/latest/contratto-di-lavoro-domestico.oas3.yaml',
  },
  {
    id: 'datore-di-lavoro-domestico',
    url: 'https://w3id.org/italia/schemas/datore-di-lavoro-domestico/latest/datore-di-lavoro-domestico.oas3.yaml',
    rawUrl: 'https://raw.githubusercontent.com/INPS-it/NDC/main/assets/schemas/datore-di-lavoro-domestico/latest/datore-di-lavoro-domestico.oas3.yaml',
  },
  {
    id: 'domanda-naspi',
    url: 'https://w3id.org/italia/schemas/domanda-naspi/latest/domanda-naspi.oas3.yaml',
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectUrl }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredUrls = SCHEMA_URLS.filter((schema) =>
    schema.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schema.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredUrls.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredUrls[selectedIndex]) {
        const selectedUrl = filteredUrls[selectedIndex].rawUrl || filteredUrls[selectedIndex].url;
        onSelectUrl(selectedUrl);
        handleClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIndex(0);
    onClose();
  };

  const handleSelectUrl = (schema: SchemaUrl) => {
    const selectedUrl = schema.rawUrl || schema.url;
    onSelectUrl(selectedUrl);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      className="command-palette-modal"
      size="lg"
      centered
    >
      <ModalHeader toggle={handleClose}>
        Open Schema
      </ModalHeader>
      <ModalBody>
        <div className="command-palette-search">
          <Input
            type="text"
            placeholder="Search schemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            innerRef={inputRef}
            autoFocus
          />
        </div>
        <div className="command-palette-results">
          {filteredUrls.length > 0 ? (
            <ul className="list-unstyled">
              {filteredUrls.map((schema, index) => (
                <li
                  key={schema.id}
                  className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectUrl(schema)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="schema-id">{schema.id}</div>
                  <div className="schema-url">{schema.url}</div>
                  {schema.rawUrl && (
                    <div className="schema-raw-url">→ {schema.rawUrl}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">No schemas found</div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
