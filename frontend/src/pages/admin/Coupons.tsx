// src/pages/admin/Coupons.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCupons, createCupom, updateCupom, deleteCupom } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, Tag } from 'lucide-react';

type Cupom = {
  id: string;
  codigo: string;
  tipo: 'PERCENTUAL' | 'VALOR';
  valor: number;
  minimo: number | null;
  usosMaximos: number | null;
  usosAtuais: number;
  ativo: boolean;
  dataExpiracao: string | null;
  criadoEm: string;
};

const emptyForm = {
  codigo: '',
  tipo: 'PERCENTUAL' as 'PERCENTUAL' | 'VALOR',
  valor: '',
  minimo: '',
  usosMaximos: '',
  dataExpiracao: '',
  ativo: true,
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const Coupons = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCupom, setEditingCupom] = useState<Cupom | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [cupomToDelete, setCupomToDelete] = useState<Cupom | null>(null);

  const { data: cupons = [], isLoading } = useQuery({
    queryKey: ['cupons'],
    queryFn: () => getCupons(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createCupom(data, token!),
    onSuccess: () => {
      toast({ title: 'Cupom criado!' });
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCupom(id, data, token!),
    onSuccess: () => {
      toast({ title: 'Cupom atualizado!' });
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCupom(id, token!),
    onSuccess: () => {
      toast({ title: 'Cupom removido.' });
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    onSettled: () => setCupomToDelete(null),
  });

  const openCreate = () => {
    setEditingCupom(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Cupom) => {
    setEditingCupom(c);
    setForm({
      codigo: c.codigo,
      tipo: c.tipo,
      valor: String(c.valor),
      minimo: c.minimo !== null ? String(c.minimo) : '',
      usosMaximos: c.usosMaximos !== null ? String(c.usosMaximos) : '',
      dataExpiracao: c.dataExpiracao ? c.dataExpiracao.substring(0, 16) : '',
      ativo: c.ativo,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.codigo.trim() || !form.valor) {
      toast({ title: 'Preencha código e valor.', variant: 'destructive' });
      return;
    }
    const payload = {
      codigo: form.codigo,
      tipo: form.tipo,
      valor: parseFloat(form.valor),
      minimo: form.minimo ? parseFloat(form.minimo) : null,
      usosMaximos: form.usosMaximos ? parseInt(form.usosMaximos) : null,
      dataExpiracao: form.dataExpiracao || null,
      ativo: form.ativo,
    };
    if (editingCupom) {
      updateMutation.mutate({ id: editingCupom.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const isExpired = (c: Cupom) => !!c.dataExpiracao && new Date() > new Date(c.dataExpiracao);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Cupons de Desconto</h1>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista de Cupons</CardTitle></CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <p className="p-6">Carregando...</p>
          ) : cupons.length === 0 ? (
            <p className="p-6 text-muted-foreground">Nenhum cupom criado ainda.</p>
          ) : (
            <ul className="divide-y">
              {cupons.map((c: Cupom) => (
                <li key={c.id} className="flex items-start gap-3 p-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted flex-shrink-0 mt-0.5">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm font-mono tracking-wider">{c.codigo}</span>
                      <Badge variant={c.ativo && !isExpired(c) ? 'default' : 'secondary'} className="text-xs">
                        {!c.ativo ? 'Inativo' : isExpired(c) ? 'Expirado' : 'Ativo'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {c.tipo === 'PERCENTUAL' ? `${c.valor}% off` : `${formatCurrency(Number(c.valor))} off`}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {c.minimo !== null && (
                        <p>Mínimo: {formatCurrency(Number(c.minimo))}</p>
                      )}
                      <p>
                        Usos: {c.usosAtuais}{c.usosMaximos !== null ? ` / ${c.usosMaximos}` : ' (ilimitado)'}
                      </p>
                      <p>Expira em: {formatDate(c.dataExpiracao)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setCupomToDelete(c)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCupom ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Código *</Label>
              <Input
                value={form.codigo}
                onChange={(e) => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                placeholder="EX: DESCONTO10"
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v: 'PERCENTUAL' | 'VALOR') => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTUAL">Percentual (%)</SelectItem>
                    <SelectItem value="VALOR">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm(f => ({ ...f, valor: e.target.value }))}
                  placeholder={form.tipo === 'PERCENTUAL' ? '10' : '5.00'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pedido mínimo (R$)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.minimo}
                  onChange={(e) => setForm(f => ({ ...f, minimo: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Máx. de usos</Label>
                <Input
                  type="number" min="1" step="1"
                  value={form.usosMaximos}
                  onChange={(e) => setForm(f => ({ ...f, usosMaximos: e.target.value }))}
                  placeholder="Ilimitado"
                />
              </div>
            </div>
            <div>
              <Label>Data de expiração</Label>
              <Input
                type="datetime-local"
                value={form.dataExpiracao}
                onChange={(e) => setForm(f => ({ ...f, dataExpiracao: e.target.value }))}
              />
            </div>
            {editingCupom && (
              <div className="flex items-center justify-between border rounded-lg p-3">
                <Label htmlFor="ativo" className="cursor-pointer">Cupom ativo</Label>
                <Switch
                  id="ativo"
                  checked={form.ativo}
                  onCheckedChange={(v) => setForm(f => ({ ...f, ativo: v }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Exclusão */}
      <AlertDialog open={!!cupomToDelete} onOpenChange={() => setCupomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cupom?</AlertDialogTitle>
            <AlertDialogDescription>
              O cupom <span className="font-bold font-mono">{cupomToDelete?.codigo}</span> será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => cupomToDelete && deleteMutation.mutate(cupomToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Coupons;
