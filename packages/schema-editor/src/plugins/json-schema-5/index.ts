import { ArrayModel } from './components/array-model';
import { ModelCollapse } from './components/model-collapse';
import { ModelRoot } from './components/model-root';
import { Models } from './components/models';
import { ModelsBreadcrumb } from './components/models-breadcrumb';
import ObjectModel from './components/object-model';
import { PrimitiveModel } from './components/primitive-model';

export const JSONSchema5Plugin = () => ({
  components: {
    Models,
    ModelsBreadcrumb,
    ModelRoot,
    ModelCollapse,
    PrimitiveModel,
    ArrayModel,
    ObjectModel,
  },
});

export default JSONSchema5Plugin;
