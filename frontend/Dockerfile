# Refs:
# https://dev.to/otomato_io/how-to-optimize-production-docker-images-running-nodejs-with-yarn-504b
# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
FROM node:19.2-bullseye-slim

ENV REACT_APP_API_ENV=local
ENV REACT_APP_DOMINO_DEPLOY_MODE=local-compose

# ENV PATH /app/node_modules/.bin:$PATH
WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app
RUN mkdir -p node_modules/.cache
RUN chmod -R 777 node_modules/.cache

RUN yarn install
# --frozen-lockfile --production
RUN yarn cache clean

USER node
CMD ["yarn", "start:local"]
