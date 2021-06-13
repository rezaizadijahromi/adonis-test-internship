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

## Env settings
**PORT** : Port this app is going to run on 3333

**MYSQL_USER** : If you change the username or password during installation you should  user those if you not default should be root   


### Db setting

- go to .env file and for MYSQL_USER and MYSQL_PASSWORD add your username and password (when you installing mysql ask you to add password and username default is root but if you change the default you should add your username and password)

  
- now you are good to go and test it on postman for start register for getting a token 
to access private route by adding that token
