import { Button } from 'design-react-kit';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="d-flex justify-content-center p-5">
      <Link to="/standalone?url=/schemas/example-schema.oas3.yaml">
        <Button className="me-2" color="primary" size="lg">
          Standalone Schema
        </Button>
      </Link>
      <Link to="/standalone?url=/schemas/test-schema.oas3.yaml">
        <Button className="me-2" color="primary" size="lg">
          Standalone Test
        </Button>
      </Link>
      <Link to="/schema-viewer">
        <Button className="me-2" color="primary" size="lg">
          Schema Viewer
        </Button>
      </Link>

      <Link to="/ace">
        <Button className="me-2" color="primary" size="lg">
          ACE editor
        </Button>
      </Link>
    </div>
  );
}
