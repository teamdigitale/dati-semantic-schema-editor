import { Button, Form, Icon, Input, Sidebar } from 'design-react-kit';
import { Controller, useForm } from 'react-hook-form';
import { Config, useConfiguration } from '../../features/configuration';

const PREDEFINED_SPARQL_ENDPOINTS = [
  {
    label: 'ISTAT Virtuoso',
    url: 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql',
  },
  {
    label: 'EU Publications Office',
    url: 'https://publications.europa.eu/webapi/rdf/sparql',
  },
  {
    label: 'CORDIS',
    url: 'https://cordis.europa.eu/datalab/sparql',
  },
];

export function SideMenu() {
  const { config, setConfig } = useConfiguration();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, isDirty },
  } = useForm<Config>({
    defaultValues: {
      sparqlUrl: config.sparqlUrl || '',
    },
  });

  const onSubmit = (data: Config) => {
    setConfig(data);
    reset(data);
  };

  return (
    <Sidebar className="p-0">
      {/* Buttons */}
      {/* <div className="d-flex flex-column justify-content-center p-4 border-top">
        <Button color="primary" size="sm">
          URL
          <Icon icon="it-copy" size="sm" color="white" className="ms-2" />
        </Button>
        <Button color="primary" size="sm" className="mt-2">
          OAS Checker URL
          <Icon icon="it-copy" size="sm" color="white" className="ms-2" />
        </Button>
      </div> */}

      {/* Configuration inputs */}
      <div className="d-flex flex-column justify-content-center p-4 border-top">
        <Form onSubmit={handleSubmit(onSubmit)} className="pt-3">
          <div className="mb-3">
            <label className="form-label">Quick Select</label>
            <select
              className="form-select"
              onChange={(e) => {
                if (e.target.value) {
                  setValue('sparqlUrl', e.target.value, { shouldDirty: true, shouldValidate: true });
                }
              }}
              defaultValue=""
            >
              <option value="">Choose a predefined endpoint...</option>
              {PREDEFINED_SPARQL_ENDPOINTS.map((endpoint) => (
                <option key={endpoint.url} value={endpoint.url}>
                  {endpoint.label} - {endpoint.url}
                </option>
              ))}
            </select>
          </div>

          <Controller
            name="sparqlUrl"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input label="SparQL URL" {...field} />}
          />

          <Button color="primary" size="sm" className="w-100" disabled={!isValid || !isDirty}>
            Save
            <Icon icon="it-check" size="sm" color="white" className="ms-2" />
          </Button>
        </Form>
      </div>
    </Sidebar>
  );
}
