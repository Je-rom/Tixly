import { PrismaClient } from '@prisma/client';
const prismaClientSingleton = () => {
  return new PrismaClient({
    transactionOptions: {
      timeout: 120000, // default: 5000
    },
    log: [{ emit: 'event', level: 'query' }],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
