import { Icon } from 'design-react-kit';
import { useSchemaNavigation } from '../../../overview/components/Navigation';

export function NavigateBack() {
  const { back } = useSchemaNavigation();

  return (
    <a href="#" className="text-decoration-none" onClick={() => back()}>
      <Icon icon="it-chevron-left" color="primary"></Icon>
    </a>
  );
}
