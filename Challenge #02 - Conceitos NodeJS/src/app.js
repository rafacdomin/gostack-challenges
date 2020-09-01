const express = require('express');
const cors = require('cors');

const { uuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// list all repositories
app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

// add a new repository to the list
app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;

  const repo = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repo);

  return response.status(201).json(repo);
});

// update repository info
app.put('/repositories/:id', (request, response) => {
  const { id } = request.params;

  const repo = repositories.find((repository) => repository.id === id);

  if (!repo) {
    return response.status(400).json({ error: 'repository does not exists' });
  }

  const {
    title = repo.title,
    url = repo.url,
    techs = repo.techs,
  } = request.body;

  const Index = repositories.findIndex((repository) => repository.id === id);

  repositories[Index] = {
    id,
    title,
    url,
    techs,
    likes: repo.likes,
  };

  return response.status(200).json(repositories[Index]);
});

// remove a repository from the list
app.delete('/repositories/:id', (request, response) => {
  const { id } = request.params;

  const index = repositories.findIndex((repo) => repo.id === id);

  if (index < 0) {
    return response.status(400).json({ error: 'repository does not exists' });
  }

  repositories.splice(index, 1);

  return response.status(204).send();
});

// increment the repository likes
app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params;

  const index = repositories.findIndex((repo) => repo.id === id);

  if (index < 0) {
    return response.status(400).json({ error: 'repository does not exists' });
  }

  const { title, url, techs, likes } = repositories.find(
    (repository) => repository.id === id
  );

  const repo = {
    id,
    title,
    url,
    techs,
    likes: likes + 1,
  };

  repositories[index] = repo;

  return response.status(200).json(repo);
});

module.exports = app;
