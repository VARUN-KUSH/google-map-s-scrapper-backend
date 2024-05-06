#using Node as base image
FROM node

#setting the working directory
WORKDIR /app

COPY . /app

#install deps
RUN npm install

#copy the application to your container


#set environment variable if needed
EXPOSE 3000

#run the start script in the command line
CMD npm start
