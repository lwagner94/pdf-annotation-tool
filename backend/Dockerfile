FROM node:11

RUN useradd app

WORKDIR /code

RUN mkdir /files

COPY package*.json ./
RUN yarn
COPY . .

WORKDIR /code/public/frontend
RUN yarn
RUN yarn build-production
WORKDIR /code

EXPOSE 3000
ENV NODE_ENV production
CMD ["yarn", "start"]