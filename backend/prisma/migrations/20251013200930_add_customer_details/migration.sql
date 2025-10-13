/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "data_nascimento" TIMESTAMP(3),
ADD COLUMN     "genero" TEXT,
ADD COLUMN     "sobrenome" TEXT,
ADD COLUMN     "telefone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");
