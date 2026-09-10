import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { AdminModel } from '../src/models/admin.model.js';
import { CategoryModel } from '../src/models/category.model.js';
import { InquiryModel } from '../src/models/inquiry.model.js';
import { LeadModel } from '../src/models/lead.model.js';
import { ProductModel } from '../src/models/product.model.js';

async function main(): Promise<void> {
  await connectDatabase();
  const models = [AdminModel, CategoryModel, InquiryModel, LeadModel, ProductModel];

  for (const model of models) {
    const changes = await model.syncIndexes();
    logger.info({ collection: model.collection.name, changes }, 'Collection indexes synchronized');
  }
}

main()
  .catch((error: unknown) => {
    logger.error({ err: error }, 'Index synchronization failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
