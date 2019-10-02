FROM node:alpine

LABEL maintainer="osdevisnot@gmail.com"

WORKDIR /usr/src

RUN yarn global add unpkg-package-manager

RUN yarn init --yes

RUN yarn add preact klick

RUN upm init

RUN cat upm.yml

RUN upm 

RUN cat upm-lock.yml

RUN find web_modules

RUN upm 

RUN find web_modules

CMD [ "sh" ]

