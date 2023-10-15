import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import { __cookieName__, __dbHost__, __dbName__, __dbPassword__, __dbUser__, __prod__, __secret__ } from "./constants";
import microConfig from "./mikro-orm.config"
import express from "express"
import { ApolloServer } from "@apollo/server"
import { buildSchema } from "type-graphql"
import {GraphQLSchema } from "graphql"
import { HelloResolver } from "./resolvers/hello";
import { json } from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import RedisStore from "connect-redis"
import Redis from "ioredis"
import session from "express-session"
import { MyContext } from './types';

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up()

    orm.em.fork();

    const app = express();
    const cors = require('cors')


    let redisClient = Redis.createClient()
    redisClient.connect().catch(console.error)

    // Initialize store.
    let redisStore = new RedisStore({
        client: redisClient,
        prefix: "myapp:",
        disableTouch: true,
        disableTTL: true
    })


    app.use(session({
        name: __cookieName__,
        store: redisStore,
        secret: __secret__,
        resave: false,
        cookie: { 
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: __prod__, //cookie only works in https,
            sameSite: 'lax'
        }, // 30 days
        // Insert express-session options here
        saveUninitialized: false
    }));


    const schema:GraphQLSchema = await buildSchema({
        resolvers: [HelloResolver, PostResolver, UserResolver],
        validate: false,
    })

    const apolloServer = new ApolloServer({
        schema,
    });

    await apolloServer.start();

    app.use(
        '/graphql',
        json(),
        cors({ 
            origin: ['http://localhost:3000'],
            credentials: true,
        }),
        expressMiddleware(apolloServer, {
            context: async ({ req, res }): Promise<MyContext> => ({ em: orm.em, req, res }),
        }),
    );


    app.listen(8000, () => {
        console.log('server started on port 8000')
    })
};

main().catch((err) => {
    console.error(err);
});
