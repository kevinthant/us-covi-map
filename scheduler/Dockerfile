FROM node:11.7.0

RUN apt update -y &&  apt install -y yarn

COPY app /app
WORKDIR /app

RUN cd /app && yarn install

CMD [ "npm", "run", "start:watch" ]

