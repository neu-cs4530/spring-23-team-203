import { randomUUID } from 'crypto';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { PollSettings, TownEmitter, PlayerPartial } from '../types/CoveyTownSocket';
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
    const creator = {id: nanoid(), name: "Jessss"};
    const dateCreated = new Date();
    // const votes = [['jess', 'danish'], [], ['tingwei'], ['david']];
    const settings: PollSettings = { anonymize: false, multiSelect: false };
    testPoll = new Poll(creator, question, options, settings)
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
  });

  describe('Poll class', () => {
    it('getVoters returns list of unique voters', () => {

      const testVoters = ['jess', 'danish', 'tingwei', 'david'];
      testPoll.vote({ id: 'jess', name: 'jess' }, [0]);
      testPoll.vote({ id: 'danish', name: 'danish' }, [0]);
      testPoll.vote({ id: 'tingwei', name: 'tingwei' }, [2]);
      testPoll.vote({ id: 'david', name: 'david' }, [3]);
      
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

      const testVoter = {id: "1", name: "jesssss"}
      const expected = [testVoter]

      testPoll.vote(testVoter, [1])
      
      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[0]).toHaveLength(0);
      expect(testPoll.votes[2]).toHaveLength(0);
      expect(testPoll.votes[3]).toHaveLength(0);
      expect(testPoll.votes[1]).toEqual(expected);
    });
    
    // it('Vote works when new user id voting for an option with multiple votes already', () => {
    //   expect(testPoll.votes).toHaveLength(4);
    //   expect(testPoll.votes[1]).toHaveLength(0);
    //   expect(testPoll.votes[0]).toHaveLength(0);
    //   expect(testPoll.votes[2]).toHaveLength(0);
    //   expect(testPoll.votes[3]).toHaveLength(0);

    //   const testVoter = {id: "voter id", name: "Jess"}

    //   const expectedVotes = testPoll.votes.map((item: PlayerPartial[]) => 
    //     item.map((obj: PlayerPartial) => {
    //       return {...obj}
    //     }))
      
    //   expectedVotes[1].push(testVoter)

    //   testPoll.vote(testVoter, [1])
      
    //   expect(testPoll.votes).toHaveLength(4);
    //   expect(testPoll.votes[1]).toHaveLength(0);
    //   expect(testPoll.votes[2]).toHaveLength(1);
    //   expect(testPoll.votes[3]).toHaveLength(1);
    //   expect(testPoll.votes[0]).toEqual(expectedVotes);
    // });
  });
});
