import { createContext, useContext, type ReactNode } from 'react';
import { defaultContainer, type AppServices } from './container';

const ServicesContext = createContext<AppServices>(defaultContainer);

interface ServicesProviderProps {
  /** Permite injetar um container diferente (ex: mocks em teste). */
  services?: AppServices;
  children: ReactNode;
}

/**
 * Ponto de injeção de dependências para a árvore React.
 * Envolva a aplicação (ou um subteste) com este provider para trocar as
 * implementações concretas sem tocar em nenhuma página/componente.
 */
export function ServicesProvider({ services = defaultContainer, children }: ServicesProviderProps) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  return useContext(ServicesContext);
}

export function useClientsRepository() {
  return useServices().clientsRepository;
}

export function useContactsRepository() {
  return useServices().contactsRepository;
}

export function useOpportunitiesRepository() {
  return useServices().opportunitiesRepository;
}

export function useDashboardRepository() {
  return useServices().dashboardRepository;
}
