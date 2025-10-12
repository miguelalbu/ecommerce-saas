// /src/pages/admin/ProductForm.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getCategories, createProduct, getProductById, updateProduct, BACKEND_URL } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

const ProductForm = () => {
    const { id } = useParams<{ id: string }>(); // Pega o 'id' da URL, se existir
    const isEditMode = !!id; // Se 'id' existe, estamos no modo de edição

    const navigate = useNavigate();
    const { toast } = useToast();
    const { token } = useAuth();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Estados para os campos do formulário
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // Busca as categorias para o dropdown
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    // Se estiver em modo de edição, busca os dados do produto
    const { data: productData, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        enabled: isEditMode, // Só executa a query se estiver em modo de edição
    });

    // Efeito para pré-preencher o formulário quando os dados do produto chegam
    useEffect(() => {
        if (isEditMode && productData) {
            setName(productData.nome);
            setDescription(productData.descricao || '');
            setPrice(String(productData.preco));
            setStock(String(productData.estoque));
            setCategoryId(productData.categoriaId);
            if (productData.imageUrl) {
                setImagePreview(`${BACKEND_URL}/${productData.imageUrl}`);
            }
        }
    }, [isEditMode, productData]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // --- A CORREÇÃO ESTÁ AQUI ---
        // Em vez do atalho, vamos construir o FormData manualmente
        // usando os valores dos nossos 'useState'.
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('categoryId', categoryId);

        // A lógica da imagem continua a mesma
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (isEditMode) {
                await updateProduct(id!, formData, token!);
                toast({ title: "Sucesso!", description: "Produto atualizado com sucesso." });
            } else {
                // Garante que a imagem é obrigatória apenas na criação
                if (!imageFile) {
                    toast({ title: "Erro", description: "Por favor, selecione uma imagem.", variant: "destructive" });
                    return;
                }
                await createProduct(formData, token!);
                toast({ title: "Sucesso!", description: "Produto criado com sucesso." });
            }
            navigate('/admin/products');
        } catch (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };
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
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="categoryId">Categoria</Label>
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
                                <Label htmlFor="price">Preço</Label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="stock">Estoque</Label>
                                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div>
                            <Label htmlFor="image">Imagem do Produto</Label>
                            <Input id="image" type="file" onChange={handleImageChange} accept="image/*" required={!isEditMode} />
                            {imagePreview && <img src={imagePreview} alt="Pré-visualização" className="mt-4 w-32 h-32 object-cover rounded" />}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancelar</Button>
                            <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Salvar Produto'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductForm;