FROM node:20

# Install Chromium and dependencies for Puppeteer
RUN apt-get update && apt-get install -y chromium

WORKDIR /app
COPY . .

RUN npm install

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["node", "index.js"]