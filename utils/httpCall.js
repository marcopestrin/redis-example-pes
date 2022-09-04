import axios from 'axios';
import { client } from './cacheHandler.js';

export const getMockData = async () => {
  const cacheCharacters = await client.get('characters');
  console.log({ cacheCharacters })
  if (cacheCharacters) return JSON.parse(cacheCharacters);
  const { data } = await axios.get('https://rickandmortyapi.com/api/character');
  await client.set('characters', JSON.stringify(data));
  return data;
}