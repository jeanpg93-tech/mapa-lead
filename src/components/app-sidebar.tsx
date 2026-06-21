import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  Building2,
  Target,
  KanbanSquare,
  CheckSquare,
  Users,
  Database,
  Settings,
  MapPinned,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const principais = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Busca Territorial", url: "/buscar", icon: Search },
  { title: "Locais", url: "/locais", icon: Building2 },
];

const comercial = [
  { title: "Oportunidades", url: "/oportunidades", icon: Target },
  { title: "Funil", url: "/funil", icon: KanbanSquare },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
  { title: "Contatos", url: "/contatos", icon: Users },
];

const governanca = [
  { title: "Fontes de Dados", url: "/fontes", icon: Database },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: typeof principais) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <MapPinned className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">MapaLead</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Inteligência territorial
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Principal", principais)}
        {renderGroup("Comercial", comercial)}
        {renderGroup("Governança", governanca)}
      </SidebarContent>
    </Sidebar>
  );
}
