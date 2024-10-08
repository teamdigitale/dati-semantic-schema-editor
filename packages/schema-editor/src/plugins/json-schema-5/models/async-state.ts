export interface AsyncState<T> {
  status: 'idle' | 'pending' | 'fulfilled' | 'error';
  data?: T;
  error?: string;
}
