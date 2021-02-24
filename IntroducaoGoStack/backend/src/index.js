const { response } = require('express');
const cors = require('cors');
const { v4, validate } = require('uuid');
const express = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const projects = [];

/**
 * 
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 * 
 * middleware
 */
function logRequest(request, response, next) {
    const { method, url } = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`;

    console.time(logLabel);

    next(); // Proximo middleware

    console.timeEnd(logLabel);
}

function valididateProjectId(request, response, next) {
    const { id } = request.params;

    if (!validate(id)) {
        return response.status(400).json({ error: "Invalid project ID." });
    }

    return next();
}

app.use(logRequest);


app.get('/projects', (request, response) => {
    const { title } = request.query;

    const results = title
        ? projects.filter(project => project.title.includes(title))
        : projects

    return response.json(results);
});

app.post('/projects', (request, response) => {
    const { title, owner } = request.body;

    const project = { id: v4(), title, owner };

    projects.push(project)

    return response.json(project);
});

app.put('/projects/:id', valididateProjectId, (request, response) => {
    const { id } = request.params;
    const { title, owner } = request.body;
    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({ error: 'Project not found' })
    }

    const project = {
        id,
        title,
        owner
    };

    projects[projectIndex] = project;

    return response.json(project);
});

app.delete('/projects/:id', valididateProjectId, (request, response) => {
    const { id } = request.params;

    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({ error: 'Project not found' })
    }

    projects.splice(projectIndex, 1);

    return response.status(204).send();
});

app.listen(3333, () => {
    console.log('🚀Back-end started!');
});