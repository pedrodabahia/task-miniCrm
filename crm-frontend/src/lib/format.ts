export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function mapApiError(statusCode: number, defaultMsg?: string): string {
  const messages: Record<number, string> = {
    400: 'Dados inválidos. Verifique os campos e tente novamente.',
    404: 'Registro não encontrado.',
    409: 'Conflito: este registro já existe.',
    500: 'Erro interno do servidor. Tente novamente.',
  };
  return messages[statusCode] || defaultMsg || 'Ocorreu um erro inesperado.';
}
