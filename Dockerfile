FROM mcr.microsoft.com/playwright:v1.64.1-noble
WORKDIR /app
ENV PLAYWRIGHT_HTML_OPEN=never
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN chmod 777 /app
CMD ["npx", "playwright", "test"]
