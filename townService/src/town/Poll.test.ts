import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import Poll from './Poll';

/**
 * Test scripts for the Poll model.
 */
describe('Poll', () => {
  let testPoll: Poll;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const pollId = nanoid();
  const question = 'What is the best CS class?';
  const options = ['CS4530', 'CS3300', 'CS3000', 'CS2500'];
  const creatorId = nanoid();
  const dateCreated = new Date();
  const votes = [['jess', 'danish'], [], ['tingwei'], ['david']];

  beforeEach(() => {
    mockClear(townEmitter);
    testPoll = new Poll({ pollId, creatorId, question, options, dateCreated, votes }, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
  });

  describe('Poll class', () => {
    it('getVoters returns list of unique voters', () => {
      const testVoters = ['jess', 'danish', 'tingwei', 'david'];
      expect(testPoll.getVoters()).toEqual(testVoters);
    });
  });
});
