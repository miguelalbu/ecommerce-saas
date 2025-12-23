import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Funções de formatação
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

// Função auxiliar para cor do status (Mesma lógica da lista)
const getStatusConfig = (status: string) => {
  const normalizedStatus = status ? status.toUpperCase() : "UNKNOWN";
  switch (normalizedStatus) {
    case 'PAID': return { label: 'PAGO', className: 'bg-green-600 hover:bg-green-700 text-white' };
    case 'PENDING': return { label: 'PENDENTE', className: 'bg-red-500 hover:bg-red-600 text-white' };
    case 'PROCESSANDO': return { label: 'PROCESSANDO', className: 'bg-yellow-500 hover:bg-yellow-600 text-black' };
    case 'SHIPPED': return { label: 'ENVIADO', className: 'bg-blue-500 hover:bg-blue-600 text-white' };
    case 'DELIVERED': return { label: 'ENTREGUE', className: 'bg-emerald-600 hover:bg-emerald-700 text-white' };
    case 'CANCELED': return { label: 'CANCELADO', className: 'bg-gray-500 hover:bg-gray-600 text-white' };
    default: return { label: normalizedStatus, className: 'bg-gray-400 text-white' };
  }
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>(); 
  const { token } = useAuth();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!, token!),
    enabled: !!id && !!token,
  });

  if (isLoading) return <div className="p-8 text-center">Carregando detalhes do pedido...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erro: {(error as Error).message}</div>;
  if (!order) return <div className="p-8 text-center">Pedido não encontrado.</div>;

  const statusInfo = getStatusConfig(order.status);

  return (
    <div className="animate-in fade-in duration-500">
        <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
            <Link to="/admin/orders" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> 
                Voltar para Pedidos
            </Link>
        </Button>
        
      <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
                Detalhes do Pedido
                <Badge className={`${statusInfo.className} border-none`}>{statusInfo.label}</Badge>
            </h1>
            <p className="text-muted-foreground mt-1">ID: #{order.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
             Realizado em: {formatDate(order.criadoEm)}
          </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna da Esquerda (Itens) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Itens do Pedido</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Verifica se existem itens e renderiza */}
                  {order.itens && order.itens.length > 0 ? (
                      order.itens.map((item: any) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                {item.produto?.nome || "Produto Removido/Indisponível"}
                            </TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>
                                {formatCurrency(Number(item.precoNoMomentoDaCompra || item.precoUnitario || 0))}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {formatCurrency(Number(item.precoNoMomentoDaCompra || item.precoUnitario || 0) * item.quantidade)}
                            </TableCell>
                        </TableRow>
                      ))
                  ) : (
                      // Fallback visual caso não tenha itens (ex: dados antigos)
                      <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                              Detalhes dos itens não disponíveis.
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Se houver observação, mostra aqui */}
          {order.observacao && (
            <Card>
                <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-700">{order.observacao}</p>
                </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna da Direita (Resumo e Cliente) */}
        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <Card>
            <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"><span>Subtotal</span> <span>{formatCurrency(Number(order.valor_total))}</span></div>
              <div className="flex justify-between text-sm"><span>Frete</span> <span>R$ 0,00</span></div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg text-emerald-700">
                  <span>Total</span> <span>{formatCurrency(Number(order.valor_total))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente (COM A CORREÇÃO DE TELA BRANCA) */}
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
                {order.cliente ? (
                    // Caso 1: Venda Online (Cliente existe no banco)
                    <>
                        <div>
                            <span className="font-semibold block">Nome:</span>
                            <span>{order.cliente.nome} {order.cliente.sobrenome}</span>
                        </div>
                        <div>
                            <span className="font-semibold block">Email:</span>
                            <span className="text-blue-600">{order.cliente.email}</span>
                        </div>
                        <div>
                            <span className="font-semibold block">CPF:</span>
                            <span>{order.cliente.cpf || '-'}</span>
                        </div>
                        <div>
                            <span className="font-semibold block">Telefone:</span>
                            <span>{order.cliente.telefone || '-'}</span>
                        </div>
                    </>
                ) : (
                    // Caso 2: Venda Balcão (Cliente é null)
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                        <Badge variant="secondary" className="mb-2 bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
                            Venda de Balcão
                        </Badge>
                        <div>
                            <span className="font-semibold block text-gray-600">Identificação:</span>
                            <span className="text-lg font-medium">{order.cliente_nome || 'Consumidor Final'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            * Venda realizada presencialmente ou sem cadastro completo.
                        </p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;