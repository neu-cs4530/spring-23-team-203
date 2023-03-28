import { randomUUID } from 'crypto';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { PlayerPartial, PollSettings, TownEmitter } from '../types/CoveyTownSocket';
import Poll from './Poll';

function addBulkVotes(poll: Poll, votes: [PlayerPartial, number[]][]) {
  votes.forEach(([player, option]) => {
    poll.addVote(player, option);
  });
}

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
  const [jess, danish, tingwei, david] = [
    { id: 'jess', name: 'jess' },
    { id: 'danish', name: 'danish' },
    { id: 'tingwei', name: 'tingwei' },
    { id: 'david', name: 'david' },
  ];
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

    it('toModel returns votes as anonymized if settings.anonymize is true', () => {
      const newPoll = new Poll(creator, question, options, { anonymize: true, multiSelect: false });
      addBulkVotes(newPoll, [
        [jess, [0]],
        [danish, [0]],
        [tingwei, [2]],
        [david, [3]]
      ]);

      const pollModel = newPoll.toModel();
      expect(pollModel.responses).toEqual([2, 0, 1, 1]);
    });
  });
});
