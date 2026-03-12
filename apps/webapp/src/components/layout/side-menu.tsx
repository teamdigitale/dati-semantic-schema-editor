import { Button, Form, FormGroup, Icon, Input, Sidebar, Toggle } from 'design-react-kit';
import { Controller, useForm } from 'react-hook-form';
import { Config, useConfiguration } from '../../features/configuration';

export function SideMenu() {
  const { config, setConfig } = useConfiguration();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm<Config>({
    defaultValues: {
      sparqlUrl: config.sparqlUrl || '',
      sparqlAutocompleteEnabled: config.sparqlAutocompleteEnabled ?? false,
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
          <Controller
            name="sparqlUrl"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input label="SparQL URL" {...field} />}
          />

          <FormGroup check className="mt-3">
            <Controller
              name="sparqlAutocompleteEnabled"
              control={control}
              render={({ field }) => (
                <Toggle
                  label="Enable SPARQL class autocomplete"
                  checked={!!field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
              )}
            />
          </FormGroup>

          <Button color="primary" size="sm" className="w-100 mt-3" disabled={!isValid || !isDirty}>
            Save
            <Icon icon="it-check" size="sm" color="white" className="ms-2" />
          </Button>
        </Form>
      </div>
    </Sidebar>
  );
}
