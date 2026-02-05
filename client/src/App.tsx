import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import OrderPrint from "./pages/OrderPrint";
import AccountsPayable from "./pages/AccountsPayable";
import AccountsReceivable from "./pages/AccountsReceivable";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Projects from "./pages/Projects";
import Calendar from "./pages/Calendar";

import Leads from "./pages/Leads";
import Contracts from "./pages/Contracts";
import RecurringExpenses from "./pages/RecurringExpenses";
import Tasks from "./pages/Tasks";
import Support from "./pages/Support";
import Budgets from "./pages/Budgets";

function Router() {
  return (
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
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
