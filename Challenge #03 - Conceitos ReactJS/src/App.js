import React from 'react';
import { useState, useEffect } from 'react';
import api from './services/api';

import './styles.css';

function App() {
  const [Repos, setRepos] = useState([]);

  useEffect(() => {
    getRepos();
  }, []);

  async function getRepos() {
    const response = await api.get('/repositories');

    setRepos(response.data);
  }

  async function handleAddRepository() {
    const response = await api.post('/repositories', {
      title: 'Amazon',
      url: 'https://github.com/rafacdomin/proffy',
      techs: ['NodeJS', 'ReactJS', 'ReactNative'],
    });

    const newRepo = response.data;

    setRepos([...Repos, newRepo]);
  }

  async function handleRemoveRepository(id) {
    await api.delete(`/repositories/${id}`);

    const repos = [...Repos];
    const repoIndex = repos.findIndex((repo) => repo.id === id);
    repos.splice(repoIndex, 1);

    setRepos(repos);
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {Repos.map((repo) => (
          <li key={repo.id}>
            {repo.title}
            <button onClick={() => handleRemoveRepository(repo.id)}>
              Remover
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
