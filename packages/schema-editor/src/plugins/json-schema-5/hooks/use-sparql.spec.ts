import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration';
import { useSparqlQuery } from './use-sparql';

describe('useSparqlQuery', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.com' });
  });

  it('should fetch again if query changes', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ foo: 'bar' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ foo: 'baz' })));
    const { result, rerender } = renderHook((query: string = 'testrequest') => useSparqlQuery(query));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    rerender('anothertestrequest');
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should avoid refetch if query not changed', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ foo: 'bar' })));
    const { result, rerender } = renderHook(() => useSparqlQuery('testrequest'));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    rerender();
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should trim whitespaces in sparqlUrl', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ foo: 'bar' })));
    const { result } = renderHook(() => useSparqlQuery(' testrequest '));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(fetchSpy).toHaveBeenCalledWith('https://sparql.com?format=json&query=%20testrequest%20', expect.anything());
  });

  it('should skip if option is provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ foo: 'bar' })));
    renderHook(() => useSparqlQuery('testrequest', { skip: true }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
