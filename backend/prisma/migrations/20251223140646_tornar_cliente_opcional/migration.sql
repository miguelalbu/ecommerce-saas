-- DropForeignKey
ALTER TABLE "public"."pedidos" DROP CONSTRAINT "pedidos_cliente_id_fkey";

-- AlterTable
ALTER TABLE "pedidos" ALTER COLUMN "cliente_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
