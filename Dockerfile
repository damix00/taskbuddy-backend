FROM node:20-bullseye

WORKDIR /app

COPY . .

# update git repo
RUN git pull

# install dependencies
RUN npm install
# install typescript
RUN npm i -g typescript

# set port 
ENV PORT=9500

# build typescript source
RUN tsc

EXPOSE 9500:9500

# start app
CMD [ "npm", "start" ]