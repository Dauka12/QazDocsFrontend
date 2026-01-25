import { Outlet } from '@tanstack/react-router';
import Sidebar from '../components/Sidebar';
import { WorkspaceProvider } from '../hooks/useWorkspace';

const DashboardLayout = () => {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-brand-eggshell flex font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </WorkspaceProvider>
  );
};

export default DashboardLayout;
