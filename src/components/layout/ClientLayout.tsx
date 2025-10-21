import { Outlet } from 'react-router-dom';
import Layout from './Layout';

/**
 * ClientLayout wrapper for all /client/* routes
 * Uses the existing Layout component which includes Header and Footer
 */
const ClientLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ClientLayout;
