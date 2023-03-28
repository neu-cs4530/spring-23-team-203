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

  beforeEach(() => {
    mockClear(townEmitter);
    
    const pollId = nanoid();
    const question = 'What is the best CS class?';
    const options = ['CS4530', 'CS3300', 'CS3000', 'CS2500'];
    const creatorId = nanoid();
    const dateCreated = new Date();
    const votes = [['jess', 'danish'], [], ['tingwei'], ['david']];
    const settings: PollSettings = { anonymize: false, multiSelect: false };
    testPoll = new Poll(
      { pollId, creatorId, question, options, settings, dateCreated, votes },
    );
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

  describe('Vote', () => {
    it('Vote works when new user id voting for an option with no votes', () => {
      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[1]).toHaveLength(0);
      expect(testPoll.votes[0]).toHaveLength(2);
      expect(testPoll.votes[2]).toHaveLength(1);
      expect(testPoll.votes[3]).toHaveLength(1);

      const testVoterID = "new voter id"
      const expected = [testVoterID]

      testPoll.vote(testVoterID, 1)
      
      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[0]).toHaveLength(2);
      expect(testPoll.votes[2]).toHaveLength(1);
      expect(testPoll.votes[3]).toHaveLength(1);
      expect(testPoll.votes[1]).toEqual(expected);
    });
    
    it('Vote works when new user id voting for an option with multiple votes already', () => {
      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[1]).toHaveLength(0);
      expect(testPoll.votes[0]).toHaveLength(2);
      expect(testPoll.votes[2]).toHaveLength(1);
      expect(testPoll.votes[3]).toHaveLength(1);

      const testVoterID = "new voter id"
      const expected = [...testPoll.votes[0]]
      expected.push(testVoterID)

      testPoll.vote(testVoterID, 0)
      
      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[1]).toHaveLength(0);
      expect(testPoll.votes[2]).toHaveLength(1);
      expect(testPoll.votes[3]).toHaveLength(1);
      expect(testPoll.votes[0]).toEqual(expected);
    });
  });
});
