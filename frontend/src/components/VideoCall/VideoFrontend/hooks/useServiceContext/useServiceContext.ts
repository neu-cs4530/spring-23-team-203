import { useContext } from 'react';
import { ServiceContext } from '../../components/ServiceProvider';

export default function useServiceContext() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }
  return context;
}
