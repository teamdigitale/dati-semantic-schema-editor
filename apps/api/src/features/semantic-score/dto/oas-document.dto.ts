import { ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

class InfoDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  version: string;
}

class ComponentsDTO {
  schemas?: Record<string, any>;
}

@ApiSchema({
  name: 'OASDocument',
  description: `An OpenAPI Specification Document serialized as YAML or JSON.`,
  // type: 'string',
  // format: 'binary',
  // maxLength: 1000000,
  // minLength: 100,
  // externalDocs: {
  //   url: 'https://raw.githubusercontent.com/OAI/spec.openapis.org/refs/heads/main/oas/3.0/schema/2024-10-18',
  //   description: 'The OpenAPI 3.0 JSON Schema',
  // },
})
export class OASDocumentDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^3\.0\.[0-9]+$/, {
    message: 'openapi must match a 3.0.x OpenAPI version',
  })
  openapi: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => InfoDTO)
  info: InfoDTO;

  @IsDefined()
  @ValidateNested()
  @Type(() => ComponentsDTO)
  components: ComponentsDTO;
}
