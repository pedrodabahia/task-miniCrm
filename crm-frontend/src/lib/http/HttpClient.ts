/**
 * Abstração de baixo nível para chamadas HTTP.
 *
 * Nenhuma outra camada (repositórios, páginas, componentes) deve depender
 * diretamente do `fetch` do browser ou de qualquer outra lib HTTP concreta.
 * Todo mundo depende desta interface (DIP - Dependency Inversion Principle).
 */
export interface IHttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
