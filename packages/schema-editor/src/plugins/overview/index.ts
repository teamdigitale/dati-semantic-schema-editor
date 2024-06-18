import OverviewContainer from './components/OverviewContainer/OverviewContainer';
import { TabOperations } from './components/Tabs/TabOperations';
import { TabWebhooks } from './components/Tabs/TabWebhooks';

export const OverviewPlugin = () => ({
  components: {
    OverviewContainer,
    TabOperations,
    TabWebhooks,
  },
});

export default OverviewPlugin;
