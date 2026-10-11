FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

# Remove husky prepare script and install dependencies
RUN npm pkg delete scripts.prepare && npm install --engine-strict=false

COPY . .

RUN npx nest build api-gateway && \
    npx nest build auth-service && \
    npx nest build rbac-service && \
    npx nest build approval-service && \
    npx nest build ledger-service && \
    npx nest build accounts-service && \
    npx nest build payment-service && \
    npx nest build batch-service && \
    npx nest build reversal-service && \
    npx nest build wallet-service

RUN echo "--- Building new services (errors expected until fixed) ---" && \
    npx nest build retry-service || echo "FAILED: retry-service"; \
    npx nest build customer-service || echo "FAILED: customer-service"; \
    npx nest build kyc-service || echo "FAILED: kyc-service"; \
    npx nest build compliance-service || echo "FAILED: compliance-service"; \
    npx nest build audit-service || echo "FAILED: audit-service"; \
    npx nest build loan-service || echo "FAILED: loan-service"; \
    npx nest build overdraft-service || echo "FAILED: overdraft-service"; \
    npx nest build notification-service || echo "FAILED: notification-service"

FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Omit dev dependencies, remove husky, and ignore engine checks
RUN npm pkg delete scripts.prepare && npm install --omit=dev --engine-strict=false

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/certs ./certs

CMD ["node", "dist/apps/api-gateway/main.js"]
