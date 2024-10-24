import { EditorLayout } from './components/Layout/EditorLayout';
import { ViewLayout } from './components/Layout/ViewLayout';
import { LayoutTypes } from './models';

export * from './models';

export const LayoutPlugin = () => ({
  components: <Record<LayoutTypes, any>>{
    [LayoutTypes.EDITOR]: EditorLayout,
    [LayoutTypes.VIEWER]: ViewLayout,
  },
});

export default LayoutPlugin;
