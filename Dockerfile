FROM node:22-slim

WORKDIR /app

ENV CI=1
ENV EXPO_NO_TELEMETRY=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--web", "--host", "0.0.0.0", "--port", "8081"]
