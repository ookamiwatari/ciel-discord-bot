FROM node:12

WORKDIR /var/app/

RUN apt-get update

ADD package.json /var/app/

RUN npm install

ADD . /var/app/

CMD npm start
