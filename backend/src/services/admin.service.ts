import { CategoryModel } from '../models/category.model.js';
import { InquiryModel } from '../models/inquiry.model.js';
import { LeadModel } from '../models/lead.model.js';
import { ProductModel } from '../models/product.model.js';

export interface AdminStats {
  products: number;
  categories: number;
  leads: number;
  inquiries: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [products, categories, leads, inquiries] = await Promise.all([
    ProductModel.countDocuments({ isActive: true }).exec(),
    CategoryModel.countDocuments({ isActive: true }).exec(),
    LeadModel.estimatedDocumentCount().exec(),
    InquiryModel.estimatedDocumentCount().exec(),
  ]);

  return { products, categories, leads, inquiries };
}
