import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getCategories, createProduct } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

const ProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Busca as categorias para o dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (imageFile) {
      formData.append('image', imageFile);
    } else {
      toast({ title: "Erro", description: "Por favor, selecione uma imagem.", variant: "destructive" });
      return;
    }

    try {
      await createProduct(formData, token!);
      toast({ title: "Sucesso!", description: "Produto criado com sucesso." });
      navigate('/admin/products');
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Novo Produto</h1>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos do Formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nome do Produto</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="categoryId">Categoria</Label>
                <Select name="categoryId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : (
                      categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Preço (ex: 89.90)</Label>
                <Input id="price" name="price" type="number" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input id="stock" name="stock" type="number" required />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" />
            </div>
            
            <div>
              <Label htmlFor="image">Imagem do Produto</Label>
              <Input id="image" type="file" onChange={handleImageChange} accept="image/*" required />
              {imagePreview && <img src={imagePreview} alt="Pré-visualização" className="mt-4 w-32 h-32 object-cover rounded" />}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancelar</Button>
              <Button type="submit">Salvar Produto</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;