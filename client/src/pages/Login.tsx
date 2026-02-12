import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    checkHasUsers();
    checkAuth();
  }, []);

  const checkHasUsers = async () => {
    try {
      const response = await fetch("/api/auth/has-users");
      const data = await response.json();
      setHasUsers(data.hasUsers);
      if (!data.hasUsers) {
        setIsRegister(true);
      }
    } catch (error) {
      console.error("Error checking users:", error);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (data.authenticated) {
        setLocation("/");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("As senhas não coincidem");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Erro ao registrar");
          setIsLoading(false);
          return;
        }

        toast.success(data.isFirstUser 
          ? "Conta de administrador criada com sucesso!" 
          : "Conta criada com sucesso!");
        setLocation("/");
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Erro ao fazer login");
          setIsLoading(false);
          return;
        }

        toast.success("Login realizado com sucesso!");
        setLocation("/");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasUsers === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {!hasUsers ? "Criar Conta de Administrador" : isRegister ? "Criar Conta" : "Entrar"}
          </CardTitle>
          <CardDescription>
            {!hasUsers 
              ? "Configure a primeira conta de administrador do sistema"
              : isRegister 
                ? "Preencha os dados para criar sua conta" 
                : "Entre com suas credenciais"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegister ? "Criando conta..." : "Entrando..."}
                </>
              ) : (
                isRegister ? "Criar Conta" : "Entrar"
              )}
            </Button>

            {hasUsers && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                  }}
                >
                  {isRegister ? "Já tem uma conta? Entrar" : "Não tem conta? Criar uma"}
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
