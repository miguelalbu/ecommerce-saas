// /src/pages/admin/OrdersForm.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

import { 
    getProducts, 
    createOrder, 
    getOrderById, 
    updateOrder 
} from '@/services/apiService';

// Tipos
type Product = { id: string; nome: string; preco: number | string; estoque: number };

// --- CONFIGURAÇÃO LOJA FÍSICA ---
// Se você tiver um ID de cliente específico para "Venda de Balcão" no seu banco, coloque entre as aspas.
// Se deixar vazio ou com o texto placeholder, o sistema enviará NULL (necessário ter configurado o Prisma como opcional).
const DEFAULT_STORE_CLIENT_ID = "ID_DO_CLIENTE_BALCAO_AQUI"; 

const OrdersForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const navigate = useNavigate();
    const { toast } = useToast();
    const { token } = useAuth();
    const queryClient = useQueryClient();

    // Estados do Formulário
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [totalPrice, setTotalPrice] = useState<string>('');
    const [status, setStatus] = useState('PAID'); // Venda física geralmente já sai Paga
    const [observation, setObservation] = useState('');

    // 1. Busca Produtos
    const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: () => getProducts(), 
        enabled: !!token,
    });

    // 2. Busca Pedido para Edição (se estiver editando)
    const { data: orderData, isLoading: isLoadingOrder } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrderById(id!, token!), 
        enabled: isEditMode && !!token,
    });

    // Efeito para preencher dados na edição
    useEffect(() => {
        if (isEditMode && orderData) {
            // Tenta pegar o primeiro item do pedido para preencher o form
            const firstItem = orderData.items?.[0] || orderData.itens?.[0]; 
            if (firstItem) {
                setProductId(firstItem.productId || firstItem.produtoId);
                setQuantity(firstItem.quantity || firstItem.quantidade);
            }
            // Mapeia campos que podem vir em inglês ou português do backend
            setTotalPrice(String(orderData.valor_total || orderData.valorTotal || orderData.totalAmount || '0'));
            setStatus(orderData.status);
            setObservation(orderData.observacao || orderData.observation || '');
        }
    }, [isEditMode, orderData]);

    // Cálculo automático de preço (Preço Unitário x Quantidade)
    useEffect(() => {
        if (productId && products) {
            const selectedProduct = products.find(p => p.id === productId);
            if (selectedProduct) {
                const unitPrice = Number(selectedProduct.preco);
                const total = (unitPrice * quantity).toFixed(2);
                setTotalPrice(total);
            }
        }
    }, [productId, quantity, products]);

    // Mutação para Salvar
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (!token) throw new Error("Autenticação necessária.");
            
            // Lógica para definir o Cliente:
            // 1. Edição: Mantém o ID original.
            // 2. Novo: Tenta usar o ID padrão. Se for o placeholder, manda null.
            const userIdToSend = isEditMode 
                ? (orderData.clienteId || orderData.userId)
                : (DEFAULT_STORE_CLIENT_ID !== "ID_DO_CLIENTE_BALCAO_AQUI" ? DEFAULT_STORE_CLIENT_ID : null);

            // Payload formatado para o Backend (Node/Prisma)
            const payload = {
                clienteId: userIdToSend,         // Backend espera: clienteId
                valor_total: Number(totalPrice), // Backend espera: valor_total
                status: status,
                cliente_nome: "Venda Balcão",    // Nome padrão caso não tenha ID
                observacao: observation,         // Backend espera: observacao
                items: [
                    {
                        productId: productId,
                        quantity: Number(quantity),
                        unitPrice: Number(totalPrice) / Number(quantity) 
                    }
                ],
            };
            
            console.log("Enviando Payload:", payload); // Para debug

            return isEditMode 
                ? updateOrder(id!, payload, token) 
                : createOrder(payload, token);
        },
        onSuccess: () => {
            toast({ title: "Venda Registrada!", description: "O pedido foi salvo com sucesso." });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Atualiza estoque visualmente
            navigate('/admin/orders');
        },
        onError: (error: Error) => {
            console.error("Erro detalhado:", error);
            toast({ 
                title: "Erro ao finalizar", 
                description: "Falha ao registrar venda. Verifique o console (F12) para detalhes.", 
                variant: "destructive" 
            });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (!productId || !quantity || !totalPrice) {
            toast({ title: "Atenção", description: "Selecione o produto e a quantidade.", variant: "destructive" });
            return;
        }

        mutation.mutate({});
    };

    if (isLoadingOrder && isEditMode) return <div>Carregando pedido...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Editar Pedido' : 'Nova Venda (Loja Física)'}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Dados da Venda</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Seleção de Produto */}
                            <div className="md:col-span-2">
                                <Label htmlFor="product">Produto *</Label>
                                <Select value={productId} onValueChange={setProductId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o Produto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingProducts ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                                            products?.map((prod) => (
                                                <SelectItem key={prod.id} value={prod.id}>
                                                    {prod.nome} (Estoque: {prod.estoque}) | R$ {Number(prod.preco).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quantidade */}
                            <div>
                                <Label htmlFor="quantity">Quantidade *</Label>
                                <Input 
                                    id="quantity" 
                                    type="number" 
                                    min="1" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                                    required 
                                />
                            </div>

                            {/* Valor Total */}
                            <div>
                                <Label htmlFor="totalPrice">Valor Total (R$) *</Label>
                                <Input 
                                    id="totalPrice" 
                                    type="number" 
                                    step="0.01" 
                                    value={totalPrice} 
                                    onChange={(e) => setTotalPrice(e.target.value)} 
                                    required 
                                />
                                <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente.</p>
                            </div>

                            {/* Status */}
                            <div>
                                <Label htmlFor="status">Status do Pedido</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pendente</SelectItem>
                                        <SelectItem value="PAID">Pago</SelectItem>
                                        <SelectItem value="SHIPPED">Enviado</SelectItem>
                                        <SelectItem value="DELIVERED">Entregue</SelectItem>
                                        <SelectItem value="CANCELED">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Observações */}
                        <div>
                            <Label htmlFor="observation">Observações / Detalhes</Label>
                            <Textarea 
                                id="observation" 
                                value={observation} 
                                onChange={(e) => setObservation(e.target.value)} 
                                placeholder="Ex: Cliente pagou no Pix..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/orders')}>Cancelar</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Processando...' : (isEditMode ? 'Salvar Alterações' : 'Finalizar Venda')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrdersForm;