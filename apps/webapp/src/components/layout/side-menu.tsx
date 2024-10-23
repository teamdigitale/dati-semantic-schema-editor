import { Button, Form, Icon, Input, Sidebar } from 'design-react-kit';
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

          <Button color="primary" size="sm" className="w-100" disabled={!isValid || !isDirty}>
            Save
            <Icon icon="it-check" size="sm" color="white" className="ms-2" />
          </Button>
        </Form>
      </div>
    </Sidebar>
  );
}
