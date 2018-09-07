const express = require('express');
const express_graphql = require('express-graphql');
let { buildSchema } = require('graphql');
const {MongoClient, ObjectID} = require('mongodb');
let db = null;

init = async() => {
    try {
        db = await MongoClient.connect('mongodb://localhost:27017/Course');
    } catch (e) {
        console.log(e);
    }
}

// GraphQL Schema
let schema = buildSchema(`
    type Query {
        course(id: Int!): Course
        courses(topic: String!): [Course!]
    }
    type Mutation {
        updateCourse(id: Int!, topic: String!): Course
        insertCourse(id: Int!
            title: String
            author: String
            description: String
            topic: String
            url: String): Course
        deleteCourse(id: Int!): Course
    }
    type Course {
        id: Int
        title: String
        author: String
        description: String
        topic: String
        url: String
    }
`);

// Support methods used to execute DB operations
let getCourse = async (args) => {
    let id = args.id;
    return await db.collection('coursesData').findOne({ id: id });
};

let insertCourseTopic = async (args) => {
    const res = await db.collection('coursesData').insert(args);
    return res['ops'][0];
}

let getCourses = async (args) => {
    let topic = args.topic;
    return await db.collection('coursesData').findOne({ topic: topic });
};

let updateCourseTopic = async (args) => {
    return await db.collection('coursesData').findOneAndUpdate({ id: args.id }, {id: args.id, title: args.title, author: args.author, description: args.description, topic: args.topic, url: args.url});
};

let deleteCourseTopic = async (args) => {
    return await db.collection('coursesData').deleteOne({id: args.id});
};

// Root Resolver
let root = {
    course: getCourse,
    courses: getCourses,
    updateCourse: updateCourseTopic,
    insertCourse: insertCourseTopic,
    deleteCourse: deleteCourseTopic
};

// Create an express server and a GraphQL endpoint
const app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('Express GraphQL Server now running on localhost:4000/graphql');
});

init();