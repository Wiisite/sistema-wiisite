import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Loader2 } from "lucide-react";

// Lazy load all page components for better initial load performance
const Home = lazy(() => import("./pages/Home"));
const Customers = lazy(() => import("./pages/Customers"));
const Products = lazy(() => import("./pages/Products"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderPrint = lazy(() => import("./pages/OrderPrint"));
const AccountsPayable = lazy(() => import("./pages/AccountsPayable"));
const AccountsReceivable = lazy(() => import("./pages/AccountsReceivable"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Reports = lazy(() => import("./pages/Reports"));
const Projects = lazy(() => import("./pages/Projects"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Leads = lazy(() => import("./pages/Leads"));
const Contracts = lazy(() => import("./pages/Contracts"));
const RecurringExpenses = lazy(() => import("./pages/RecurringExpenses"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Support = lazy(() => import("./pages/Support"));
const Budgets = lazy(() => import("./pages/Budgets"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/customers"} component={Customers} />
        <Route path={"/products"} component={Products} />
        <Route path={"/orders"} component={Orders} />
        <Route path={"/orders/:id/print"} component={OrderPrint} />
        <Route path={"/accounts-payable"} component={AccountsPayable} />
        <Route path={"/accounts-receivable"} component={AccountsReceivable} />
        <Route path={"/suppliers"} component={Suppliers} />
        <Route path={"/reports"} component={Reports} />
        <Route path={"/projects"} component={Projects} />
        <Route path="/calendar" component={Calendar} />
        <Route path={"/leads"} component={Leads} />
        <Route path={"/budgets"} component={Budgets} />
        <Route path={"/contracts"} component={Contracts} />
        <Route path={"/recurring-expenses"} component={RecurringExpenses} />
        <Route path={"/tasks"} component={Tasks} />
        <Route path={"/support"} component={Support} />
        <Route path={"/settings/company"} component={CompanySettings} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
