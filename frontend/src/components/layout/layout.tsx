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
    <div>
      <Header searchInputRef={searchInputRef} />
      <div>
        <SidebarProvider className="">
          <AppSidebar />
          <div className="flex-1">
            <main>
              <div className="container mx-auto">
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
