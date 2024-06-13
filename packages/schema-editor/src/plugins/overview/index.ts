import OverviewContainer from './components/OverviewContainer/OverviewContainer';
import { TabModels } from './components/Tabs/TabModels';
import { TabOperations } from './components/Tabs/TabOperations';
import { TabWebhooks } from './components/Tabs/TabWebhooks';
import { ModelCollapse } from './components/Models/ModelCollapse';
import { TabModelsBreadcrumb } from './components/Tabs/TabModelsBreadcrumb';
import { ModelContainer } from './components/Models/ModelContainer';

export const OverviewPlugin = () => ({
  components: {
    OverviewContainer,
    TabOperations,
    TabWebhooks,
    TabModels,
    TabModelsBreadcrumb,
    ModelCollapse,
    ModelContainer,
  },
});

export default OverviewPlugin;
