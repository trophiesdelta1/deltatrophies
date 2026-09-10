import { Router } from 'express';
import {
  createInquiry,
  createLead,
  getInquiries,
  getLeads,
} from '../controllers/inquiry.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { submissionRateLimit } from '../middleware/rate-limits.js';
import { validateRequest } from '../middleware/validate-request.js';
import {
  createInquiryRequestSchema,
  createLeadRequestSchema,
  inquiryListRequestSchema,
} from '../validation/inquiry.schemas.js';

export const inquiryRouter = Router();

inquiryRouter.post(
  '/lead',
  submissionRateLimit,
  validateRequest(createLeadRequestSchema),
  createLead,
);
inquiryRouter.post(
  '/',
  submissionRateLimit,
  validateRequest(createInquiryRequestSchema),
  createInquiry,
);
inquiryRouter.get('/leads', authenticate, validateRequest(inquiryListRequestSchema), getLeads);
inquiryRouter.get('/all', authenticate, validateRequest(inquiryListRequestSchema), getInquiries);
