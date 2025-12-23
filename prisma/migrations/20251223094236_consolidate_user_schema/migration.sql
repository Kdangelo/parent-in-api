-- AlterTable
   ALTER TABLE "public"."users" ADD COLUMN "lastName" TEXT;
   -- AlterTable
   ALTER TABLE "public"."users" ALTER COLUMN "password" DROP NOT NULL;
   -- AlterTable
   ALTER TABLE "public"."users" ALTER COLUMN "name" SET NOT NULL;