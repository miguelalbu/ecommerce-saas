import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminLogin, customerLogin, customerRegister } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";

interface AuthPageProps {
  userType: 'admin' | 'customer';
}

const AuthPage = ({ userType }: AuthPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (mode === 'login') {
        response = userType === 'admin' 
          ? await adminLogin(email, password)
          : await customerLogin(email, password);
        
        login(response.token);
        toast({ title: "Login realizado com sucesso!" });
        
        const destination = userType === 'admin' ? '/admin/dashboard' : '/';
        navigate(destination);

      } else {
        // Lógica de Registro (só para clientes)
        response = await customerRegister(name, email, password);
        toast({ title: "Cadastro realizado com sucesso!", description: "Você já pode fazer o login." });
        setMode('login');
      }
    } catch (error) {
      toast({
        title: "Ocorreu um erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const title = userType === 'admin' ? "Painel do Administrador" : "Acesse sua Conta";
  const description = mode === 'login' 
    ? "Entre com suas credenciais para continuar" 
    : "Crie sua conta para começar a comprar";

  return (
    <div className="min-h-screen flex items-center justify-center bg-luar-green p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{mode === 'login' ? title : "Criar Conta"}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 5. Campo de nome aparece apenas no modo de registro */}
            {mode === 'register' && (
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)} required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Registrar')}
            </Button>
          </form>

          {/* 6. Botão para alternar entre login e registro (só para clientes) */}
          {userType === 'customer' && (
            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Não tem uma conta?{" "}
                  <Button variant="link" onClick={() => setMode('register')} className="p-0">
                    Registre-se
                  </Button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <Button variant="link" onClick={() => setMode('login')} className="p-0">
                    Faça o login
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;