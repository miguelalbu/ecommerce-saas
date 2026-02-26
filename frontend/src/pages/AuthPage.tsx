import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminLogin, customerLogin, customerRegister } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import { maskCPF, maskPhone, validateRegisterForm, type RegisterErrors } from "@/lib/validators";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<RegisterErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (mode === 'login') {
        let response;
        let isAdmin = false;

        // Tenta autenticar como admin; se falhar, tenta como cliente
        try {
          response = await adminLogin(email, password);
          isAdmin = true;
        } catch {
          response = await customerLogin(email, password);
        }

        login(response.token);
        toast({ title: "Login realizado com sucesso!" });
        navigate(isAdmin ? '/admin/dashboard' : '/');

      } else {
        // Validação client-side antes de chamar a API
        const validationErrors = validateRegisterForm({
          name, sobrenome, email, password, confirmPassword, cpf, telefone,
        });

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-luar-green p-4">
      <Card className="w-full max-w-lg animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === 'login' ? "Faça seu login" : "Criar uma conta"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* FORMULÁRIO DE LOGIN */}
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

            {/* FORMULÁRIO DE REGISTRO */}
            {mode === 'register' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={errors.name ? "border-red-500" : ""}
                      required
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input id="sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    required
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
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
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(maskCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className={errors.cpf ? "border-red-500" : ""}
                    />
                    {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className={errors.telefone ? "border-red-500" : ""}
                    />
                    {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-red-500" : ""}
                      required
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                      required
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Carregando...' : (mode === 'login' ? 'Continuar' : 'Cadastrar')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Não tem uma conta?{" "}
                  <Button variant="link" onClick={() => { setMode('register'); setErrors({}); }} className="p-0">
                    Cadastre-se
                  </Button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <Button variant="link" onClick={() => { setMode('login'); setErrors({}); }} className="p-0">
                    Voltar para o login
                  </Button>
                </>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
