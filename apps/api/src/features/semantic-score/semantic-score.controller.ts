import {
  Controller,
  HttpCode,
  Inject,
  Logger,
  NotAcceptableException,
  PayloadTooLargeException,
  Post,
  StreamableFile,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { calculateSchemaSemanticScore } from '@teamdigitale/schema-editor-utils';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as yaml from 'js-yaml';
import { Config } from '../configs';
import {
  API_HEADER_RATE_LIMIT,
  API_RESPONSE_406,
  API_RESPONSE_413,
  API_RESPONSE_415,
} from '../swagger';
import { CalculateSemanticScoreRequestDTO, OASDocumentDTO } from './dto';

@Controller('semantic-score')
export class SemanticScoreController {
  private readonly logger: Logger = new Logger(SemanticScoreController.name);
  @Inject(ConfigService) private configService: ConfigService<Config, true>;

  @ApiExtraModels(OASDocumentDTO)
  @Post('')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (
          ![
            'application/yaml',
            'application/json',
            'application/octet-stream',
          ].includes(file.mimetype)
        ) {
          callback(
            new UnsupportedMediaTypeException('Invalid file type'),
            false,
          );
        } else if (file.size > 1000000) {
          callback(
            new PayloadTooLargeException('The provided file is too large.'),
            false,
          );
        } else {
          callback(null, true);
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Calculate semantic score for a YAML file',
    description: `Process an OpenAPI 3.0 specification document containing
a schema and computes its semantic score
using the associated REST API Linked Data Keywords.`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: `The OpenAPI specification document containing
a schema annotated with the REST API Linked Data Keywords.`,
    type: CalculateSemanticScoreRequestDTO,
  })
  @ApiResponse({
    status: 200,
    description: `An OpenAPI specification document containing the #/info/x-semantic-score and #/info/x-semantic-score-timestamp properties. When a YAML file is received, comments and order is not preserved.`,
    headers: { ...API_HEADER_RATE_LIMIT },
    content: {
      'application/yaml': {
        schema: {
          $ref: getSchemaPath(OASDocumentDTO),
        },
      },
      'application/json': {
        schema: {
          $ref: getSchemaPath(OASDocumentDTO),
        },
      },
    },
  })
  @ApiResponse(API_RESPONSE_406)
  @ApiResponse(API_RESPONSE_413)
  @ApiResponse(API_RESPONSE_415)
  async updateSchemaSemanticScore(
    @UploadedFile() file: any,
  ): Promise<StreamableFile> {
    this.logger.log(`Calculating schema semantic score for file`);
    this.logger.debug(`File: ${file.originalname}`);
    this.logger.debug(`File size: ${file.size} bytes`);
    this.logger.debug(`File mimetype: ${file.mimetype}`);

    // Parse file content to JS object
    this.logger.debug(`Parsing file content to JS object`);
    const fileContent = file.buffer.toString('utf-8');
    let specJson: any;
    if (
      file.mimetype === 'application/yaml' ||
      file.originalname.endsWith('.yaml')
    ) {
      specJson = yaml.load(fileContent);
      if (!specJson) {
        throw new UnsupportedMediaTypeException('Invalid YAML content');
      }
      this.logger.debug(`YAML content parsed to JSON object successfully`);
    } else if (
      file.mimetype === 'application/json' ||
      file.originalname.endsWith('.json')
    ) {
      specJson = JSON.parse(fileContent);
      if (!specJson) {
        throw new UnsupportedMediaTypeException('Invalid JSON content');
      }
    } else {
      throw new UnsupportedMediaTypeException('Invalid file type');
    }

    // Validate OAS document
    const validatedConfig = plainToInstance(OASDocumentDTO, specJson, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
      forbidUnknownValues: false,
    });
    if (errors.length > 0) {
      const errorTxt = errors
        .map((x) => x.toString(undefined, undefined, undefined, true))
        .join('\n');
      throw new NotAcceptableException(errorTxt);
    }

    // Calculate ontoscore and normalize spec
    this.logger.debug(`Calculating ontoscore`);
    const { resolvedSpecJson, schemaSemanticScore } =
      await calculateSchemaSemanticScore(specJson, {
        sparqlUrl: this.configService.get('sparqlUrl', { infer: true }),
      });
    this.logger.debug(
      `Ontoscore calculated successfully. Calculated value: ${schemaSemanticScore.toFixed(2)}`,
    );

    // Return yaml content with ontoscore
    this.logger.debug(`Dumping YAML content with ontoscore`);
    const updatedFile = yaml.dump(resolvedSpecJson);
    this.logger.debug(`YAML content with ontoscore dumped successfully`);

    this.logger.log(`Schema semantic score calculated successfully`);

    return new StreamableFile(Buffer.from(updatedFile), {
      type: 'application/yaml',
      disposition: 'attachment; filename="spec.yaml"',
    });
  }
}
