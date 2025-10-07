import OverviewContainer from './components/OverviewContainer/OverviewContainer';
import { TabOperations } from './components/Tabs/TabOperations';
import { TabWebhooks } from './components/Tabs/TabWebhooks';
import { TabHelp } from './components/Tabs/TabHelp';
import { TabGraph } from './components/Tabs/TabGraph';

export const OverviewPlugin = () => ({
  components: {
    OverviewContainer,
    TabOperations,
    TabWebhooks,
    TabHelp,
    TabGraph,
  },
});

export default OverviewPlugin;
