import { Button } from 'design-react-kit';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="d-flex justify-content-center p-5">
      <Link to="/standalone">
        <Button className="me-2" color="primary" size="lg">
          Standalone
        </Button>
      </Link>

      <Link to="/swaggerui">
        <Button className="me-2" color="primary" size="lg">
          SwaggerUI
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
