import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SparqlQueryOptions, useSparqlQuery } from './use-sparql';

describe('useSparqlQuery', () => {
  it('should fetch again if query changes', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ foo: 'bar' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ foo: 'baz' })));
    const { result, rerender } = renderHook((query: string = 'testrequest') =>
      useSparqlQuery(query, { sparqlUrl: 'https://sparql.com' }),
    );
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    rerender('anothertestrequest');
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should avoid refetch if query not changed', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ foo: 'bar' })));
    const { result, rerender } = renderHook(() => useSparqlQuery('testrequest', { sparqlUrl: 'https://sparql.com' }));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    rerender();
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should trim whitespaces in sparqlUrl', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ foo: 'bar' })));
    const { result } = renderHook(() => useSparqlQuery(' testrequest ', { sparqlUrl: 'https://sparql.com' }));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(fetchSpy).toHaveBeenCalledWith('https://sparql.com?format=json&query=%20testrequest%20', expect.anything());
  });

  it('should skip if option is provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ foo: 'bar' })));
    renderHook(() => useSparqlQuery('testrequest', { sparqlUrl: 'https://sparql.com', skip: true }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should discard fetch results if query changes', async () => {
    let resolvePromise: any;
    let fetchPromise: Promise<Response>;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementationOnce(() => {
      fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      return fetchPromise;
    });

    const options: SparqlQueryOptions = { sparqlUrl: 'https://sparql.com' };

    const { result, rerender } = renderHook((props: [string, SparqlQueryOptions]) => useSparqlQuery(...props), {
      initialProps: ['query1', options],
    });
    expect(result.current.status).toBe('pending');
    await waitFor(() => expect(fetchPromise).toBeDefined());

    rerender(['query2', { ...options, skip: true }]); // Update query in order to expect "idle" status and no results discarding fetch results
    expect(result.current.status).toBe('idle');

    resolvePromise(new Response(JSON.stringify({ foo: 'bar' })));

    await waitFor(() => expect(result.current.status).toBe('idle'));
    await waitFor(() => expect(result.current.data).toBeUndefined());

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
