import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPinned,
  ArrowRight,
  Search,
  Target,
  Users,
  BarChart3,
  Layers,
  CheckCircle2,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MapaLead — Inteligência territorial para prospecção" },
      { name: "description", content: "Descubra oportunidades comerciais no território certo. MapaLead organiza locais, leads e ações para corretores, imobiliárias e equipes de vendas." },
      { property: "og:title", content: "MapaLead — Inteligência territorial para prospecção" },
      { property: "og:description", content: "Descubra oportunidades comerciais no território certo. MapaLead organiza locais, leads e ações para corretores, imobiliárias e equipes de vendas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const nav = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Planos", href: "#planos" },
];

const features = [
  {
    icon: Search,
    title: "Busca territorial",
    description: "Foque esforços em bairros, condomínios e regiões comerciais com maior potencial de conversão.",
  },
  {
    icon: Target,
    title: "Oportunidades qualificadas",
    description: "Converta dados em leads. Acompanhe status, prioridade e histórico de cada oportunidade.",
  },
  {
    icon: Users,
    title: "Gestão de contatos",
    description: "Centralize relacionamentos, mantenha informações atualizadas e nunca perca uma conversa.",
  },
  {
    icon: BarChart3,
    title: "Funil visual",
    description: "Visualize o estágio de cada negócio e identifique gargalos com indicadores claros.",
  },
  {
    icon: Layers,
    title: "Tarefas e ações",
    description: "Organize visitas, ligações e follow-ups em uma agenda integrada ao funil.",
  },
  {
    icon: Shield,
    title: "Controle de acesso",
    description: "Perfis de usuário, autenticação segura e auditoria para times em crescimento.",
  },
];

const steps = [
  {
    step: "01",
    title: "Cadastre seus territórios",
    description: "Adicione bairros, condomínios, edifícios e regiões comerciais que sua equipe deve monitorar.",
  },
  {
    step: "02",
    title: "Capture oportunidades",
    description: "Registre leads e oportunidades vinculadas a cada local com status, prioridade e responsável.",
  },
  {
    step: "03",
    title: "Acompanhe e converta",
    description: "Use o funil e a agenda de tarefas para conduzir cada negócio até o fechamento.",
  },
];

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MapPinned className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">MapaLead</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Começar agora</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Protótipo em desenvolvimento
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Oportunidades escondidas no seu território
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          O MapaLead transforma dados geográficos em oportunidades comerciais reais. Organize locais, leads e ações em um só lugar — e leve sua prospecção para o próximo nível.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth">
              Acessar o painel <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#como-funciona">Conhecer a ferramenta</a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Acesso restrito. Entre com sua conta para explorar o sistema.</p>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Como funciona</h2>
          <p className="mt-4 text-muted-foreground">Três passos para colocar sua prospecção no mapa.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
              <span className="text-4xl font-bold text-primary/20">{item.step}</span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="recursos" className="border-y border-border/60 bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Tudo que você precisa para prospectar melhor</h2>
          <p className="mt-4 text-muted-foreground">Um conjunto integrado de ferramentas para equipes comerciais baseadas em território.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para testar o conceito sozinho ou em pequenas equipes.",
      features: ["Até 3 usuários", "100 locais", "Funil básico", "Exportação CSV"],
      cta: "Criar conta",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "R$ 97",
      period: "/mês",
      description: "Para times que querem escalar a prospecção com controle total.",
      features: ["Usuários ilimitados", "Locais ilimitados", "Funil avançado", "Automação de tarefas", "Relatórios e dashboards"],
      cta: "Começar trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "",
      description: "Integrações, API e suporte dedicado para grandes operações.",
      features: ["API REST", "Integrações customizadas", "SSO e roles avançadas", "Suporte prioritário", "SLA garantido"],
      cta: "Falar com vendas",
      highlighted: false,
    },
  ];

  return (
    <section id="planos" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Planos simples e diretos</h2>
          <p className="mt-4 text-muted-foreground">Escolha o melhor para o momento da sua operação.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                plan.highlighted
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-6 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Mais popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={plan.highlighted ? "default" : "outline"} className="mt-8 w-full">
                <Link to="/auth">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MapPinned className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">MapaLead</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} MapaLead. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground"><Mail className="h-4 w-4" /></a>
          <Link to="/auth" className="hover:text-foreground">Login</Link>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
