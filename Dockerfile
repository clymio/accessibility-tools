FROM europe-west1-docker.pkg.dev/clym-dev/clym-core/base-node-aws:latest AS base

#### ENVIRONMENT ARGUMENTS
ARG BUILD_ENV=dev
ARG AWS_BUCKET
ARG AWS_DISTRIBUTION_ID
ARG ACCESS_KEY
ARG SECRET_KEY
ARG AWS_PATH

# ENVIRONMENT VARIABLES
ENV BUILD_ENV ${BUILD_ENV}
ENV AWS_ACCESS_KEY_ID=${ACCESS_KEY}
ENV AWS_SECRET_ACCESS_KEY=${SECRET_KEY}


RUN mkdir -p /usr/app && \
    chown -R node:node /usr/app
WORKDIR /usr/app
USER node
COPY --chown=node:node package.json package-lock.json ./

RUN npm install

FROM base AS release
COPY --from=base --chown=node:node /usr/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN if [ "$BUILD_ENV" = "release" ]; then \
      npm run dist:linux:release; \
    else \
      npm run dist:linux; \
    fi

RUN aws s3 cp ./dist s3://$AWS_BUCKET/$AWS_PATH --recursive --cache-control max-age=86400 --acl public-read && \
    aws cloudfront create-invalidation --distribution-id $AWS_DISTRIBUTION_ID --paths "/*"