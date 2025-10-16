FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV REVALIDATE_SECRET=

COPY package.json package-lock.json ./

RUN npm install

COPY next.config.js tsconfig.json next-i18next.config.js ./
COPY public ./public
COPY pages ./pages
COPY components ./components
COPY styles ./styles
COPY types ./types
COPY utils ./utils

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
