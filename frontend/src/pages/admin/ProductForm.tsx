// /src/pages/admin/ProductForm.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch"; // Importar o Switch
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Adicionado useMutation e useQueryClient aqui
import { getCategories, createProduct, getProductById, updateProduct, BACKEND_URL } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
// REMOVIDO: import { set } from 'date-fns'; // Import não utilizado

// (Opcional, mas recomendado) Definir o tipo para os dados do produto
type Category = { id: string; nome: string; };
type ProductData = {
    id: string;
    nome: string;
    descricao: string | null;
    preco: number | string; // Prisma retorna Decimal, convertemos para string no estado
    estoque: number | string; // Convertido para string no estado
    categoriaId: string;
    isFeatured: boolean | null;
    imageUrl: string | null;
    categoria: Category; // Adicionado para tipo completo
};


const ProductForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const navigate = useNavigate();
    const { toast } = useToast();
    const { token } = useAuth(); // Pega o token do contexto
    const queryClient = useQueryClient(); // Para invalidar queries após salvar

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Estados para os campos do formulário
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);

    // Busca as categorias para o dropdown
    const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
        enabled: !!token, // Adicionado: só busca se tiver token
    });

    // Se estiver em modo de edição, busca os dados do produto
    const { data: productData, isLoading: isLoadingProduct } = useQuery<ProductData>({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        // Adicionado: só busca se for modo de edição E tiver token
        enabled: isEditMode && !!token, 
    });

    // Efeito para pré-preencher o formulário quando os dados do produto chegam
    useEffect(() => {
        if (isEditMode && productData) {
            setName(productData.nome);
            setDescription(productData.descricao || '');
            setPrice(String(productData.preco)); // Converte Decimal/Number para string
            setStock(String(productData.estoque)); // Converte Number para string
            setCategoryId(productData.categoriaId);
            setIsFeatured(productData.isFeatured || false);
            if (productData.imageUrl) {
                setImagePreview(`${BACKEND_URL}/${productData.imageUrl}`);
            }
        }
    }, [isEditMode, productData]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Cria uma URL temporária para a pré-visualização da imagem
            setImagePreview(URL.createObjectURL(file)); 
        } else {
            // Se o usuário cancelar a seleção, limpa a pré-visualização (opcional)
             if (!isEditMode || !productData?.imageUrl) { // Mantém a imagem original se estiver editando
                 setImagePreview(null);
             }
        }
    };

     // Mutação para criar ou atualizar o produto
    const mutation = useMutation({
        mutationFn: (formData: FormData) => {
            if (!token) throw new Error("Autenticação necessária."); // Garante que o token existe
            return isEditMode ? updateProduct(id!, formData, token) : createProduct(formData, token);
        },
        onSuccess: () => {
            toast({ title: "Sucesso!", description: `Produto ${isEditMode ? 'atualizado' : 'criado'} com sucesso.` });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Atualiza a lista de produtos
            navigate('/admin/products');
        },
        onError: (error: Error) => {
            toast({ title: "Erro", description: error.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} produto.`, variant: "destructive" });
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token) {
             toast({ title: "Erro", description: "Você precisa estar logado para realizar esta ação.", variant: "destructive" });
             return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('categoryId', categoryId);
        formData.append('isFeatured', String(isFeatured));

        if (imageFile) {
            formData.append('image', imageFile);
        } else if (!isEditMode) {
             // Imagem é obrigatória apenas na criação
            toast({ title: "Erro", description: "Por favor, selecione uma imagem.", variant: "destructive" });
            return;
        }
        
        mutation.mutate(formData); // Dispara a mutação (criar ou atualizar)
    };

    // Mostra carregando se estiver buscando o produto (em modo de edição)
    if (isLoadingProduct) return <div>Carregando produto...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Editar Produto' : 'Novo Produto'}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Nome do Produto *</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="categoryId">Categoria *</Label>
                                <Select value={categoryId} onValueChange={setCategoryId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingCategories ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                                            categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="price">Preço *</Label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="stock">Estoque *</Label>
                                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        
                        {/* Campo de Imagem */}
                        <div>
                            <Label htmlFor="image">Imagem do Produto {isEditMode ? '(Opcional: selecione para substituir)' : '*'}</Label>
                            <Input id="image" type="file" onChange={handleImageChange} accept="image/*" required={!isEditMode} />
                            {imagePreview && <img src={imagePreview} alt="Pré-visualização" className="mt-4 w-32 h-32 object-cover rounded" />}
                        </div>

                        {/* Campo Switch para Destaque */}
                        <div className="flex items-center space-x-2 pt-2">
                           <Switch
                             id="isFeatured"
                             checked={isFeatured}
                             onCheckedChange={setIsFeatured}
                           />
                           <Label htmlFor="isFeatured">Marcar como Produto em Destaque</Label>
                        </div>


                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancelar</Button>
                            {/* Desabilita o botão enquanto a mutação estiver ocorrendo */}
                            <Button type="submit" disabled={mutation.isPending}> 
                                {mutation.isPending ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Produto')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductForm;