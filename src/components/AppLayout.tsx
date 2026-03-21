import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
