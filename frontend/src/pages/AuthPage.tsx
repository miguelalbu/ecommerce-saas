import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  
  // Novos estados para os campos do formulário
  const [name, setName] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const response = userType === 'admin' 
          ? await adminLogin(email, password)
          : await customerLogin(email, password);
        
        login(response.token);
        toast({ title: "Login realizado com sucesso!" });
        
        const destination = userType === 'admin' ? '/admin/dashboard' : '/';
        navigate(destination);

      } else { // Modo de Registro
        if (password !== confirmPassword) {
          toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        
        const registerData = { name, sobrenome, email, password, cpf, telefone, dataNascimento, genero };
        await customerRegister(registerData);

        toast({ title: "Cadastro realizado com sucesso!", description: "Você já pode fazer o login." });
        setMode('login');
      }
    } catch (error: any) {
      toast({
        title: "Ocorreu um erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const title = userType === 'admin' ? "Painel do Administrador" : (mode === 'login' ? "Faça seu login" : "Criar uma conta");
  const description = userType === 'admin' ? "Entre com suas credenciais" : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-luar-green p-4">
      <Card className="w-full max-w-lg animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Lógica para mostrar formulário de LOGIN */}
            {mode === 'login' && (
              <>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </>
            )}

            {/* Lógica para mostrar formulário de REGISTRO */}
            {mode === 'register' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input id="sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataNascimento">Data de nascimento</Label>
                    <Input id="dataNascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="genero">Gênero</Label>
                    <Select onValueChange={setGenero} value={genero}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FEMININO">Feminino</SelectItem>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Carregando...' : (mode === 'login' ? 'Continuar' : 'Cadastrar')}
            </Button>
          </form>

          {userType === 'customer' && (
            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Não tem uma conta?{" "}
                  <Button variant="link" onClick={() => setMode('register')} className="p-0">
                    Cadastre-se
                  </Button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <Button variant="link" onClick={() => setMode('login')} className="p-0">
                    Voltar para o login
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