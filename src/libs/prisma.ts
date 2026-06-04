import { PrismaClient } from "../../prisma/generated/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString: `${process.env.DATABASE_URL}`.replace(
      "sslmode=require",
      "sslmode=no-verify",
    ),
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

// import { PrismaClient } from "../../prisma/generated/client";

// const prisma = new PrismaClient();
// export default prisma;
