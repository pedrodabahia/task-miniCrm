import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ServicesProvider } from '@/lib/di/ServicesContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import ClientList from '@/pages/clients/ClientList';
import ClientNew from '@/pages/clients/ClientNew';
import ClientDetail from '@/pages/clients/ClientDetail';
import ClientEdit from '@/pages/clients/ClientEdit';
import OpportunityList from '@/pages/opportunities/OpportunityList';
import OpportunityNew from '@/pages/opportunities/OpportunityNew';
import OpportunityDetail from '@/pages/opportunities/OpportunityDetail';
import OpportunityEdit from '@/pages/opportunities/OpportunityEdit';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <ServicesProvider>
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/new" element={<ClientNew />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/edit" element={<ClientEdit />} />
            <Route path="/opportunities" element={<OpportunityList />} />
            <Route path="/opportunities/new" element={<OpportunityNew />} />
            <Route path="/opportunities/:id" element={<OpportunityDetail />} />
            <Route path="/opportunities/:id/edit" element={<OpportunityEdit />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
    </ServicesProvider>
  );
}
