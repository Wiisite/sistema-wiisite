import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  getErrorMessage(): string {
    const error = this.state.error;
    if (!error) return "Erro desconhecido";

    // Check for common error types
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return "Erro de conexão. Verifique sua internet e tente novamente.";
    }
    if (error.message.includes("chunk") || error.message.includes("loading")) {
      return "Erro ao carregar a página. Tente recarregar.";
    }
    if (error.message.includes("permission") || error.message.includes("denied")) {
      return "Você não tem permissão para acessar este recurso.";
    }

    return "Ocorreu um erro inesperado. Nossa equipe foi notificada.";
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 rounded-lg border bg-card">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-2xl font-semibold mb-2">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground text-center mb-6">
              {this.getErrorMessage()}
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer transition-opacity"
                )}
              >
                <RotateCcw size={16} />
                Recarregar Página
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-secondary text-secondary-foreground",
                  "hover:opacity-90 cursor-pointer transition-opacity"
                )}
              >
                <Home size={16} />
                Ir para Início
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="w-full">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                  {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {this.state.showDetails ? "Ocultar detalhes" : "Mostrar detalhes técnicos"}
                </button>

                {this.state.showDetails && (
                  <div className="p-4 w-full rounded bg-muted overflow-auto">
                    <p className="text-sm font-medium text-destructive mb-2">
                      {this.state.error.name}: {this.state.error.message}
                    </p>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words mt-4">
                        Component Stack:{this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
