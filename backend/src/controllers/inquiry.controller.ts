import type { RequestHandler } from 'express';
import {
  createInquiry as createInquiryRecord,
  createLead as createLeadRecord,
  listInquiries,
  listLeads,
} from '../services/inquiry.service.js';
import type {
  CreateInquiryRequest,
  CreateLeadRequest,
  InquiryListRequest,
} from '../validation/inquiry.schemas.js';

export const createLead: RequestHandler = async (_request, response) => {
  await createLeadRecord((response.locals.validated as CreateLeadRequest).body);
  response.status(201).json({ success: true, message: 'Lead captured' });
};

export const createInquiry: RequestHandler = async (_request, response) => {
  await createInquiryRecord((response.locals.validated as CreateInquiryRequest).body);
  response.status(201).json({ success: true, message: 'Inquiry submitted' });
};

export const getLeads: RequestHandler = async (_request, response) => {
  const { query } = response.locals.validated as InquiryListRequest;
  const result = await listLeads(query);
  response.status(200).json({ success: true, leads: result.items, pagination: result.pagination });
};

export const getInquiries: RequestHandler = async (_request, response) => {
  const { query } = response.locals.validated as InquiryListRequest;
  const result = await listInquiries(query);
  response.status(200).json({
    success: true,
    inquiries: result.items,
    pagination: result.pagination,
  });
};
