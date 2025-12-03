import { useState, useEffect, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, Input } from 'design-react-kit';
import { useConfiguration } from '../../features/configuration';
import { executeSparqlQuery } from '../../utils/sparql';
import './command-palette.scss';

interface SchemaUrl {
  id: string;
  label: string;
  url: string;
}

const SPARQL_QUERY = `
prefix admsapit: <https://w3id.org/italia/onto/ADMS/>
prefix COV: <https://w3id.org/italia/onto/COV/>
prefix dcat: <http://www.w3.org/ns/dcat#>
prefix dcatapit: <http://dati.gov.it/onto/dcatapit#>
prefix dct: <http://purl.org/dc/terms/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select distinct ?label ?url where {
  ?s
    a dcatapit:Distribution ;
    dcat:downloadURL ?url ;
    rdfs:label ?label
  .
  FILTER(
    STRSTARTS(
      STR(?s),
      "https://w3id.org/italia/schemas/"
    )
  )
}
`;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectUrl }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [schemas, setSchemas] = useState<SchemaUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { config } = useConfiguration();

  // Fetch schemas from SPARQL when component mounts or when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchSchemas = async () => {
      setLoading(true);
      setError(null);
      try {
        const sparqlUrl = config?.sparqlUrl || window.__ENV?.sparqlUrl;
        if (!sparqlUrl) {
          throw new Error('SPARQL endpoint not configured');
        }

        const response = await executeSparqlQuery(sparqlUrl, SPARQL_QUERY);

        const schemaList: SchemaUrl[] = response.results.bindings.map((binding) => {
          const label = binding.label.value;
          const url = binding.url.value;

          // Extract ID from URL (e.g., "categoria-pensione" from the URL)
          const urlParts = url.split('/');
          const id = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];

          return {
            id,
            label,
            url
          };
        });

        setSchemas(schemaList);
      } catch (e) {
        console.error('Failed to fetch schemas:', e);
        setError(e instanceof Error ? e.message : 'Failed to load schemas');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, [isOpen, config]);

  const filteredUrls = schemas.filter((schema) =>
    schema.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        onSelectUrl(filteredUrls[selectedIndex].url);
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
    onSelectUrl(schema.url);
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
            disabled={loading}
          />
        </div>
        <div className="command-palette-results">
          {loading ? (
            <div className="loading-state">Loading schemas...</div>
          ) : error ? (
            <div className="error-state">
              <p>Error: {error}</p>
              <p className="error-hint">Please check the SPARQL endpoint configuration.</p>
            </div>
          ) : filteredUrls.length > 0 ? (
            <ul className="list-unstyled">
              {filteredUrls.map((schema, index) => (
                <li
                  key={schema.id}
                  className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectUrl(schema)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="schema-id">{schema.label}</div>
                  <div className="schema-url">{schema.url}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">
              {schemas.length === 0 ? 'No schemas available' : 'No schemas found'}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
