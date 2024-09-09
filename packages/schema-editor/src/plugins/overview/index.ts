import OverviewContainer from './components/OverviewContainer/OverviewContainer';
import { TabOperations } from './components/Tabs/TabOperations';
import { TabWebhooks } from './components/Tabs/TabWebhooks';
import { TabHelp } from './components/Tabs/TabHelp';

export const OverviewPlugin = () => ({
  components: {
    OverviewContainer,
    TabOperations,
    TabWebhooks,
    TabHelp,
  },
});

export default OverviewPlugin;
