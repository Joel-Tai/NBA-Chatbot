import {
  Home,
  Database,
  CircleQuestionMark,
  Mail,
  FileUser,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "About",
    url: "/about",
    icon: CircleQuestionMark,
  },
  {
    title: "Data",
    url: "/data",
    icon: Database,
  },
  {
    title: "Resume",
    url: "/assets/joel_tai.pdf",
    icon: FileUser,
    download: true,
  },
  {
    title: "Contact",
    url: "/Contact",
    icon: Mail,
  },
];

export function AppSidebar() {
  return (
    <Sidebar
      variant="inset"
      style={{
        background: "#eff6ff",
      }}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.download ? (
                      <a href={item.url} download>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
