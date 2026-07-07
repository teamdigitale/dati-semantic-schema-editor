import {
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  ParseFilePipe,
  PayloadTooLargeException,
  Post,
  SerializeOptions,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SemanticScoreSummary } from '@teamdigitale/schema-editor-utils';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as yaml from 'js-yaml';
import {
  API_HEADER_RATE_LIMIT,
  API_RESPONSE_406,
  API_RESPONSE_413,
  API_RESPONSE_415,
} from '../swagger';
import {
  CalculateSemanticScoreRequestDTO,
  OASDocumentDTO,
  SemanticScoreResponseDTO,
} from './dto';
import { SemanticScoreService } from './semantic-score.service';

@ApiTags('SemanticScore')
@Controller('semantic-score')
export class SemanticScoreController {
  private readonly logger: Logger = new Logger(SemanticScoreController.name);

  @Inject(SemanticScoreService)
  private readonly semanticScoreService!: SemanticScoreService;

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
            new UnsupportedMediaTypeException(
              'Invalid file type. Accepted types are application/yaml and application/json.',
            ),
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
    summary: 'Calculate semantic score for an OAS 3.0 document.',
    description: `Process an OpenAPI 3.0 specification document containing
a schema and computes its Semantic Score
using the associated REST API Linked Data Keywords.

The response contains the Semantic Score, that is a
numeric value between 0 and 1.`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: `The OpenAPI specification document containing
a schema annotated with the REST API Linked Data Keywords.`,
    type: CalculateSemanticScoreRequestDTO,
  })
  @ApiResponse({
    status: 200,
    description: `The provided OpenAPI specification document has been successfully processed.
The response will output informations about the global semantic score and the models processed.`,
    type: SemanticScoreResponseDTO,
    headers: { ...API_HEADER_RATE_LIMIT },
  })
  @ApiResponse(API_RESPONSE_406)
  @ApiResponse(API_RESPONSE_413)
  @ApiResponse(API_RESPONSE_415)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: SemanticScoreResponseDTO })
  async updateSchemaSemanticScore(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: any,
  ): Promise<SemanticScoreResponseDTO> {
    this.logger.log(`Calculating schema semantic score for file`);
    this.logger.debug(`File: ${file.originalname}`);
    this.logger.debug(`File size: ${file.size} bytes`);
    this.logger.debug(`File mimetype: ${file.mimetype}`);

    // Parse file content to JS object
    this.logger.debug(`Parsing file content to JS object`);
    const fileContent = file.buffer.toString('utf-8');
    let specJson: object;
    if (
      file.mimetype === 'application/yaml' ||
      file.originalname.endsWith('.yaml')
    ) {
      specJson = yaml.load(fileContent) as object;
      if (!specJson) {
        throw new UnsupportedMediaTypeException('Invalid YAML content');
      }
      this.logger.debug(`YAML content parsed to JSON object successfully`);
    } else if (
      file.mimetype === 'application/json' ||
      file.originalname.endsWith('.json')
    ) {
      specJson = JSON.parse(fileContent) as object;
      if (!specJson) {
        throw new UnsupportedMediaTypeException('Invalid JSON content');
      }
    } else {
      throw new UnsupportedMediaTypeException(
        'Invalid file type. Accepted types are application/yaml and application/json.',
      );
    }
    this.logger.debug(`File content parsed to JSON object successfully`);

    // Validate OAS document
    this.logger.debug(`Validating OAS document`);
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
    this.logger.debug(`OAS document validated successfully`);

    // Validate JSON-LD context
    this.logger.debug(`Validating JSON-LD context`);
    const jsonldContextErrors =
      await this.semanticScoreService.validateJsonldContext(specJson);
    const isJsonldContextValid = jsonldContextErrors.length === 0;
    let jsonldContextErrorTxt: string | undefined;
    if (!isJsonldContextValid) {
      if (jsonldContextErrors.length > 0) {
        jsonldContextErrorTxt = jsonldContextErrors
          .map((x) => `[${x.path.join('/')}] ${x.message}`)
          .join('\n');
      }
      this.logger.debug(
        `JSON-LD context has some errors: ${jsonldContextErrorTxt}`,
      );
      // PAY ATTENTION: The error is raised after trying to calculate the score,
      // so any info about the global score can be included in the error message.
      this.logger.debug(`Trying to continue with the calculation...`);
    }

    // Purge JSON-LD context null properties
    let purgedSpecJson: object = specJson;
    if (!isJsonldContextValid) {
      this.logger.debug(`Purging JSON-LD context null properties`);
      purgedSpecJson =
        this.semanticScoreService.purgeJsonldContextNullProperties(specJson);
      this.logger.debug(`JSON-LD context null properties purged successfully`);
    }

    // Calculate ontoscore and normalize spec
    this.logger.debug(`Calculating ontoscore`);
    let semanticScoreResult:
      | { schemaSemanticScore: number; summary: SemanticScoreSummary }
      | undefined;
    try {
      semanticScoreResult =
        await this.semanticScoreService.calculateSchemaSemanticScore(
          purgedSpecJson,
        );
      this.logger.debug(
        `Ontoscore calculated successfully with value: ${semanticScoreResult.schemaSemanticScore.toFixed(2)}`,
      );
    } catch (error) {
      this.logger.debug(`Ontoscore calculation failed: ${error.message}`);
    }

    // Successfully calculated semantic score
    if (isJsonldContextValid && semanticScoreResult) {
      this.logger.log(`Schema semantic score calculated successfully`);
      return new SemanticScoreResponseDTO(semanticScoreResult.summary);
    }

    // Handling errors
    if (!isJsonldContextValid && semanticScoreResult) {
      const errorTxt = `Potential semantic score: ${semanticScoreResult.schemaSemanticScore.toFixed(2)}.\nErrors: ${jsonldContextErrorTxt}`;
      throw new NotAcceptableException(errorTxt);
    } else if (!isJsonldContextValid && !semanticScoreResult) {
      throw new NotAcceptableException(jsonldContextErrorTxt);
    }
    throw new InternalServerErrorException('No semantic score calculated');
  }
}
