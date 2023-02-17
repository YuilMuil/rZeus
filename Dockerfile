FROM node:latest

WORKDIR /app
COPY . /app
RUN npm install
# Start the bot.
CMD ["node", "main.js"]