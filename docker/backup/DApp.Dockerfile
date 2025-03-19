FROM node:18-alpine AS base

########################################################
# builder-contracts: use `turbo prune` to prune contracts files
########################################################
 
FROM base AS builder-contracts
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Replace <your-major-version> with the major version installed in your repository. For example:
# RUN yarn global add turbo@^2
RUN pnpm global add turbo@^2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune @pfl-wsr/dex-contracts --docker

########################################################
# installer-contracts: install and compile the contracts
########################################################

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer-contracts
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY --from=builder-contracts /app/out/json/ .
RUN pnpm install --frozen-lockfile
 
# Build the project
COPY --from=builder-contracts /app/out/full/ .
RUN pnpm turbo run compile

########################################################
# builder-frontend: use `turbo prune` to prune frontend files
########################################################
 
FROM base AS builder-frontend
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Replace <your-major-version> with the major version installed in your repository. For example:
# RUN yarn global add turbo@^2
RUN pnpm global add turbo@^2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune @pfl-wsr/dex-frontend --docker

########################################################
# installer-frontend: install and build the frontend
########################################################

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer-frontend
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY --from=builder-frontend /app/out/json/ .
RUN pnpm install --frozen-lockfile
 
# Build the project
COPY --from=builder-frontend /app/out/full/ .
RUN pnpm turbo run build

########################################################
# runner: copy the build output and run the app
########################################################

FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/portfolio/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/portfolio/.next/static ./apps/portfolio/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/portfolio/public ./apps/portfolio/public
 
COPY --chown=runner:app docker/Next.js.entrypoint.sh /app/Next.js.entrypoint.sh
RUN chmod +x /app/Next.js.entrypoint.sh
CMD ["/app/Next.js.entrypoint.sh"]