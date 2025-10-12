-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSANDO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_nome" TEXT,
    "cliente_id" TEXT NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
