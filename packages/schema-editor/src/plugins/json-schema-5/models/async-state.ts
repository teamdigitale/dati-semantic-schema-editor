export type AsyncStateStatus = 'idle' | 'pending' | 'fulfilled' | 'error';

export type AsyncState<DataType, ErrorType = string> =
  | { status: 'idle'; data?: undefined; error?: undefined }
  | { status: 'pending'; data?: undefined; error?: undefined }
  | { status: 'fulfilled'; data: DataType; error?: undefined }
  | { status: 'error'; data?: undefined; error: ErrorType };
