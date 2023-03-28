import { randomUUID } from 'crypto';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { PollSettings, TownEmitter } from '../types/CoveyTownSocket';
import Poll from './Poll';

/**
 * Test scripts for the Poll model.
 */
describe('Poll', () => {
  let testPoll: Poll;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const question = 'What is the best CS class?';
  const options = ['CS4530', 'CS3300', 'CS3000', 'CS2500'];
  const creatorId = nanoid();
  const creator = { name: 'jess', id: creatorId };
  const votes = [['jess', 'danish'], [], ['tingwei'], ['david']].map(option =>
    option.map(voter => ({ id: randomUUID(), name: voter })),
  );
  const settings: PollSettings = { anonymize: false, multiSelect: false };

  beforeEach(() => {
    mockClear(townEmitter);
    testPoll = new Poll(creator, question, options, settings);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
  });

  describe('Poll class', () => {
    it('getVoters returns list of unique voters', () => {

      const testVoters = ['jess', 'danish', 'tingwei', 'david'];
      testPoll.addVote({ id: 'jess', name: 'jess' }, [0]);
      testPoll.addVote({ id: 'danish', name: 'danish' }, [0]);
      testPoll.addVote({ id: 'tingwei', name: 'tingwei' }, [2]);
      testPoll.addVote({ id: 'david', name: 'david' }, [3]);
      
      expect(testPoll.getVoters().map(voter => voter.name)).toEqual(testVoters);
    });
  });
});
