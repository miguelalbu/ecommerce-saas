/*
  Warnings:

  - You are about to drop the column `codigo_rastreio` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the `itens_pedido` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."itens_pedido" DROP CONSTRAINT "itens_pedido_pedido_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."itens_pedido" DROP CONSTRAINT "itens_pedido_produto_id_fkey";

-- AlterTable
ALTER TABLE "pedidos" DROP COLUMN "codigo_rastreio";

-- DropTable
DROP TABLE "public"."itens_pedido";
