import { FastifyInstance } from 'fastify';
import PortfolioCompany from '../models/PortfolioCompany.js';
import { authenticate } from '../middleware/auth.js';

export async function portfolioRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // GET /api/portfolio/companies
  app.get('/companies', async (_request, reply) => {
    const companies = await PortfolioCompany.find(
      {},
      { about: 0, investmentMemo: 0, marketOpportunity: 0, customersAndPricing: 0, productDetails: 0 },
    ).sort({ name: 1 });
    return reply.send(companies.map((c) => c.toJSON()));
  });

  // GET /api/portfolio/companies/:id
  app.get<{ Params: { id: string } }>('/companies/:id', async (request, reply) => {
    const company = await PortfolioCompany.findById(
      request.params.id,
      { about: 0, investmentMemo: 0, marketOpportunity: 0, customersAndPricing: 0, productDetails: 0 },
    );
    if (!company) return reply.status(404).send({ error: 'Company not found' });
    return reply.send(company.toJSON());
  });

  // GET /api/portfolio/companies/:id/about
  app.get<{ Params: { id: string } }>('/companies/:id/about', async (request, reply) => {
    const company = await PortfolioCompany.findById(request.params.id, { about: 1 });
    if (!company) return reply.status(404).send({ error: 'Company not found' });
    return reply.send(company.about);
  });

  // GET /api/portfolio/companies/:id/investment-memo
  app.get<{ Params: { id: string } }>('/companies/:id/investment-memo', async (request, reply) => {
    const company = await PortfolioCompany.findById(request.params.id, { investmentMemo: 1 });
    if (!company) return reply.status(404).send({ error: 'Company not found' });
    return reply.send(company.investmentMemo);
  });

  // GET /api/portfolio/companies/:id/market-opportunity
  app.get<{ Params: { id: string } }>('/companies/:id/market-opportunity', async (request, reply) => {
    const company = await PortfolioCompany.findById(request.params.id, { marketOpportunity: 1 });
    if (!company) return reply.status(404).send({ error: 'Company not found' });
    return reply.send(company.marketOpportunity);
  });

  // GET /api/portfolio/companies/:id/customers-pricing
  app.get<{ Params: { id: string } }>('/companies/:id/customers-pricing', async (request, reply) => {
    const company = await PortfolioCompany.findById(request.params.id, { customersAndPricing: 1 });
    if (!company) return reply.status(404).send({ error: 'Company not found' });
    return reply.send(company.customersAndPricing);
  });

  // GET /api/portfolio/companies/:id/product-details
  app.get<{ Params: { id: string } }>('/companies/:id/product-details', async (request, reply) => {
    const company = await PortfolioCompany.findById(request.params.id, { productDetails: 1 });
    if (!company) return reply.status(404).send({ error: 'Company not found' });
    return reply.send(company.productDetails);
  });
}
