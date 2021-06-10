FROM node:10-alpine
RUN npm install -g @vue/cli
RUN mkdir /harness
COPY ./ /harness
WORKDIR /harness
RUN yarn install