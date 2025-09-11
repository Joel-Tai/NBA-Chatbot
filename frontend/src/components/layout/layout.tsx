import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import Header from "./header";
import { Home } from "@/pages/main/home";
import Footer from "./footer";
function Layout() {
  const searchInputRef = useRef<any>(null);

  const handleQuery = (query: string) => {
    if (searchInputRef.current) {
      searchInputRef.current.setQueryAndSearch(query);
    }
  };
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchInputRef={searchInputRef} />
      <div className="flex-1 flex">
        <SidebarProvider className="flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <main className="flex-1">
              <div className="w-full">
                {location.pathname === "/" ? (
                  <Home onQuery={handleQuery} />
                ) : (
                  <Outlet />
                )}
              </div>
            </main>
            <Footer />
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}

export default Layout;
