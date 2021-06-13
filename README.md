# adonis-test-internship

## Requirments
  * Node.js >= 8.0.0
  * npm >= 3.0.0
  * git
  * typescript
  * mysql
  * postman

## initial setup

clone the project first and go inside project folder

```bash
git clone https://git...
cd project_name
```

#### Nodejs
Check your Node.js version and ensure you are running Node >= 8.0.0

#### install dependencies

```bash
npm install
```

## for testing

run the following commands in order

```bash
cp .env.example .env
node ace generate:key
```

then edit .env file and put your system configurations and key in it



### Starting the development server

```bash
node ace serve --watch
```

### Migration

```bash
node ace migration:run
```

### Bull config
  - for running bull you should install redis before 
  - running redis for sending welcome email run ```
   redis-server ``` to start redis server
   

## Env settings
**PORT** : Port this app is going to run on 3333

**MYSQL_USER & MYSQL_PASSWORD** : If you change the username or password during installation you should  user those if you not default should be root   

**MYSQL_DB_NAME** : 
 - First go to MYSQL Workbench (if you install the my sql properly)
 - Enter your credintials 
    - Notice: If you change the username and password during the installation you should add those if you not default should be root
 - Then in your left side you should see two options "Admininstration" and "Schemas" go to schema section and left click and choose "Create Schema..."
 
 - When you do that it opens a window and ask you name for schema you enter the name (in this case we user test) 
 - but be carefull this schema name should be equel to MYSQL_DB_NAME in you .env file
 - and then click APPLY and wait to create database and press Finish
 - well done you create your schema for this project

**user  & pass** : 
  - For sending an email for reseting password we need email and password 
  - for the **user** you should provide your own email address 
  - pass is the password for that email 
  - and also you should active less secure in your profile to sending an email
  

