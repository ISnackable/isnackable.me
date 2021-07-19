---
title: Collaborating with CTFNote
subTitle: Setting up CTFNote on Heroku
cover: CTFNote.png
---

# NOT DONE

<img src="https://github.com/TFNS/CTFNote/raw/main/screenshots/main-dark.png" width="100%" alt="CTFNote Home Page">

## Introduction

Collaborating on a CTF competition isn't really easy, especially if your team is operating remotely in a different timezone. Managing files and assignmnet of challenges get hetic. 

My team and I used to collab on Discord, and we realised that when we wanted to see the challenges we solved, we realised that we didn't post information on how to solve it. Thus, losing the steps on how to solve the challenge.

Looking for a solution, I came across, [CTFNote](https://github.com/TFNS/CTFNote), a collaborative tool aiming to help CTF teams to organise their work. This tool was 
developed by [The Flat Network Society](https://github.com/TFNS).

## Hosting it

I decided to host the application on https://www.heroku.com/. 

> Heroku is a cloud platform as a service supporting several programming languages. One of the first cloud platforms, Heroku has been in development since June 2007, when it supported only the Ruby programming language, but now supports Java, Node.js, Scala, Clojure, Python, PHP, and Go. - Wikipedia

My reason for picking Heroku is because it is **free**.

## Setting up CTF Note

```yaml
# docker-compose.yml
version: "3.7"
services:
  api:
    build:
      context: "./api"
    networks:
      - ctfnote
    environment:
      CREATE_PAD_URL: "http://hedgedoc:3000/new"
      SHOW_PAD_URL: "/"
      DATABASE_URL: "postgres://ctfnote:ctfnote@db:5432/ctfnote"
    depends_on:
      - db
  db:
    build:
      context: "./db"
    restart: always
    environment:
      POSTGRES_PASSWORD: ctfnote
      POSTGRES_USER: ctfnote
      POSTGRES_MULTIPLE_DATABASES: hedgedoc
    volumes:
      - ctfnote-db:/var/lib/postgresql/data
    networks:
      - ctfnote
  front:
    networks:
      - ctfnote
    build:
      context: "./front"
    depends_on:
      - hedgedoc
    ports:
      - 80:80
  hedgedoc:
    image: quay.io/hedgedoc/hedgedoc:1.7.2-debian
    environment:
      - CMD_DB_URL=postgres://ctfnote:ctfnote@db:5432/hedgedoc
      - CMD_URL_PATH=pad
      - CMD_IMAGE_UPLOAD_TYPE=filesystem
    depends_on:
      - db
    restart: always
    volumes:
      - pad-uploads:/home/hackmd/app/public/uploads
    networks:
      - ctfnote
volumes:
  ctfnote-db:
  pad-uploads:
networks:
  ctfnote:
```

```bash
docker-compose up -d
```

## Using it

<img src="https://github.com/TFNS/CTFNote/raw/graphql/screenshots/tasks.png" width="100%" alt="CTFNote Tasks Page">

<img src="https://github.com/TFNS/CTFNote/blob/main/screenshots/task.png?raw=true" width="100%" alt="CTFNote Task Page">

## Acknowledgement

https://github.com/TFNS/CTFNote/tree/main