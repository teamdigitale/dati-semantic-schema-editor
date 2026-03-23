import { ArrayModel } from './components/array-model';
import { RDFHelperButtonWithModal } from './components/common/helper';
import { RDFOntologicalClassHelperBlock } from './components/common/helper/rdf-helper-block';
import { RDFHelperClassVocabulariesBlock } from './components/common/helper/rdf-helper-class-vocabularies-block';
import { GraphSchema } from './components/common/oas-graph/graph-schema';
import { Model } from './components/model';
import { ModelCollapse } from './components/model-collapse';
import { ModelRoot } from './components/model-root';
import { Models } from './components/models';
import { ModelsBreadcrumb } from './components/models-breadcrumb';
import { ObjectModel } from './components/object-model';
import { PrimitiveModel } from './components/primitive-model';

export * from './hooks';
export * from './utils';

export const JSONSchema5Plugin = () => ({
  components: {
    Models,
    ModelsBreadcrumb,
    ModelRoot,
    Model,
    ModelCollapse,
    PrimitiveModel,
    ArrayModel,
    ObjectModel,
    GraphSchema,
    RDFHelperButtonWithModal,
    RDFHelperClassVocabulariesBlock,
    RDFOntologicalClassHelperBlock,
  },
});

export default JSONSchema5Plugin;
