FROM node:21-alpine
USER root

#setup the build args from the cicd pipeline
ARG APP_SRC
ARG TENANT

# update image and install dependencies
RUN apk update
RUN apk add --no-cache tar gzip
RUN apk add openjdk17 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community

# create the app directory and copy the app
RUN mkdir -p /data/apps/www/orion /data/logs/www/ /data/apps/certs/www/ /data/config/
COPY ${APP_SRC} /data/apps/www/orion/orion-frontend.tar.gz
COPY configs/${TENANT}/.env /data/apps/www/orion/.env
COPY configs/${TENANT}/entrypoint.sh /data/apps/www/orion/entrypoint.sh
COPY configs/${TENANT}/injectConfig.js /data/apps/www/orion/injectConfig.js
COPY configs/${TENANT}/ecosystem.config.js /data/apps/www/orion/ecosystem.config.js

#install needed deps
RUN npm install -g pm2@latest
RUN cd /data/apps/www/orion/ && npm i dotenv
RUN cd /data/apps/www/orion/ && npm i node-schedule
RUN cd /data/apps/www/orion/ && npm i node-fetch
RUN cd /data/apps/www/orion/ && npm i @next/bundle-analyzer
RUN cd /data/apps/www/orion/ && npm i concurrently

# set permissions on the entrypoint script
RUN chmod +x /data/apps/www/orion/entrypoint.sh
RUN chmod +x /data/apps/www/orion/injectConfig.js
RUN chmod +x /data/apps/www/orion/ecosystem.config.js

# extract the app and remove the tar file
RUN tar -C /data/apps/www/orion/ -xvzf  /data/apps/www/orion/orion-frontend.tar.gz
RUN cd /data/apps/www/orion/ && ls -aF
RUN rm -f /data/apps/www/orion/orion-frontend.tar.gz

# move required files to right location for Orion and Health Montior to work
RUN cp -R /data/apps/www/orion/.next/standalone/* /data/apps/www/orion
RUN cp -R /data/apps/www/orion/dist/* /data/apps/www/orion
RUN cp  /data/apps/www/orion/server/camunda-dmn-simulator.jar /data/apps/www/orion
RUN rm -rf /data/apps/www/orion/server


# build version of the .env file
#RUN cp /data/apps/www/orion/.next/standalone/.env /data/apps/www/orion/.env

# set the working directory permissions and then output the .env fro validation
RUN cd /data/apps/www/orion/ && ls -aF
RUN cat /data/apps/www/orion/.env

# setup docker for execution
WORKDIR /data/apps/www/orion/

EXPOSE 8080
ENV PORT 8080

#ENV NODE_OPTIONS='--inspect=8820'
#CMD [ "node", "-r", "@contrast/agent", "src/server.js" ]
#CMD ["npm","start","orion-frontend/.next/package.json"]
#ENTRYPOINT ["node", "server.js"]
ENTRYPOINT ["./entrypoint.sh"]
CMD ["pm2", "--no-daemon", "start", "ecosystem.config.js"]