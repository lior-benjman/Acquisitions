import { z } from 'zod';

export const ProductCategories = ['beauty', 'supplement'];

export const createProductSchema = z.object({
  name: z
    .string({
      required_error: 'Product name is required',
    })
    .min(2, 'Product name must be at least 2 characters')
    .max(255, 'Product name must be at most 255 characters'),
  category: z.enum(ProductCategories, {
    errorMap: () => ({
      message: 'Category must be either beauty or supplement',
    }),
  }),
  imageUrl: z
    .string({
      required_error: 'Image URL is required',
    })
    .url('Please provide a valid image URL'),
  linkUrl: z
    .string({
      required_error: 'Purchase URL is required',
    })
    .url('Please provide a valid purchase URL'),
});
