import { applyDecorators } from '@nestjs/common';
import { Exclude, Expose, ExposeOptions } from 'class-transformer';

export const ExposeConditionally = (
  options: { enabled: boolean } & ExposeOptions,
) => {
  const { enabled, ...rest } = options;
  return enabled ? applyDecorators(Expose(rest)) : applyDecorators(Exclude());
};
