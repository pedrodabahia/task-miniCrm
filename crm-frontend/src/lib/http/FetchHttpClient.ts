import { ApiError, type IHttpClient } from './HttpClient';

/**
 * Implementação concreta de IHttpClient usando a Fetch API.
 *
 * A baseUrl é injetada via construtor em vez de lida de uma variável global,
 * o que permite trocar de ambiente (produção, testes, mocks) sem tocar em
 * nenhum repositório que dependa de IHttpClient.
 */
export class FetchHttpClient implements IHttpClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });

    if (!res.ok) {
      let message = 'Erro interno do servidor';
      try {
        const body = await res.json();
        message = body.message || message;
      } catch {
        // resposta sem corpo JSON, mantém a mensagem padrão
      }
      throw new ApiError(res.status, message);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}
