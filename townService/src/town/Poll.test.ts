import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { PollSettings, TownEmitter, PlayerPartial } from '../types/CoveyTownSocket';
import Poll from './Poll';

// testing util helper function: an easy way to add many votes at once to test different
// poll states
function addBulkVotes(poll: Poll, votes: [PlayerPartial, number[]][]) {
  votes.forEach(([player, option]) => {
    poll.vote(player, option);
  });
}

/**
 * Test scripts for the Poll model.
 */
describe('Polls', () => {
  let testPoll: Poll;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const question = 'What is the best CS class?';
  const options = ['CS4530', 'CS3300', 'CS3000', 'CS2500'];
  const creator = { id: nanoid(), name: 'Jessss' };
  let settings: PollSettings;

  const playerId1 = 'jessie';
  const playerId2 = 'dvd';
  const playerId3 = 'danish';

  beforeEach(() => {
    settings = { anonymize: false, multiSelect: false };
    mockClear(townEmitter);
    testPoll = new Poll(creator, question, options, settings);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
  });

  describe('userVoted', () => {
    it('userVoted returns true if a player has voted and false if they have not', () => {
      expect(testPoll.userVoted(playerId1)).toBe(false);
      expect(testPoll.userVoted(playerId2)).toBe(false);

      testPoll.vote({ id: playerId1, name: 'jess' }, [0]);
      testPoll.vote({ id: playerId2, name: 'david' }, [1]);

      expect(testPoll.userVoted(playerId1)).toBe(true);
      expect(testPoll.userVoted(playerId2)).toBe(true);
      expect(testPoll.userVoted(playerId3)).toBe(false);
    });
  });

  describe('GetVoters', () => {
    it('getVoters returns list of unique voters when no one has voted multiple times', () => {
      const testVotersIds = [playerId1, playerId2, playerId3];
      const testVotersNames = ['jess', 'danish', 'david'];
      testPoll.vote({ id: playerId1, name: 'jess' }, [0]);
      testPoll.vote({ id: playerId2, name: 'danish' }, [0]);
      testPoll.vote({ id: playerId3, name: 'david' }, [2]);

      expect(testPoll.getVoters().map(voter => voter.id)).toEqual(testVotersIds);
      expect(testPoll.getVoters().map(voter => voter.name)).toEqual(testVotersNames);
    });

    it('getVoters returns correct number of total voters (multiselect)', () => {
      settings = { anonymize: false, multiSelect: true };
      testPoll = new Poll(creator, question, options, settings);

      // 0 voter when no one has voted
      expect(testPoll.getVoters().map(voter => voter.name)).toEqual([]);

      testPoll.vote({ id: playerId1, name: 'jess' }, [0, 1]);
      testPoll.vote({ id: playerId2, name: 'david' }, [1]);

      expect(testPoll.getVoters().map(voter => voter.id)).toEqual([playerId1, playerId2]);
      expect(testPoll.getVoters().map(voter => voter.name)).toEqual(['jess', 'david']);
    });
  });

  describe('ToModel', () => {
    it('toModel returns model version of poll', () => {
      const [jess, danish, tingwei, david] = [
        { id: 'jess', name: 'jess' },
        { id: 'danish', name: 'danish' },
        { id: 'tingwei', name: 'tingwei' },
        { id: 'david', name: 'david' },
      ];

      const newPoll = new Poll(creator, question, options, { anonymize: true, multiSelect: false });
      addBulkVotes(newPoll, [
        [jess, [0]],
        [danish, [0]],
        [tingwei, [2]],
        [david, [3]],
      ]);

      const pollModel = newPoll.toModel();
      expect(pollModel).toEqual({
        creator,
        options,
        pollId: newPoll.pollId,
        question,
        responses: [2, 0, 1, 1],
        settings: { anonymize: true, multiSelect: false },
      });
    });

    it('toModel returns votes as de-anonymized if settings are true', () => {
      const [jess, danish, tingwei, david] = [
        { id: 'jess', name: 'jess' },
        { id: 'danish', name: 'danish' },
        { id: 'tingwei', name: 'tingwei' },
        { id: 'david', name: 'david' },
      ];

      const newPoll = new Poll(creator, question, options, settings);
      addBulkVotes(newPoll, [
        [jess, [0]],
        [danish, [0]],
        [tingwei, [2]],
        [david, [3]],
      ]);

      const pollModel = newPoll.toModel();
      expect(pollModel.responses).toStrictEqual([[jess, danish], [], [tingwei], [david]]);
    });

    it('toModel returns votes as anonymized if settings.anonymize is true', () => {
      const [jess, danish, tingwei, david] = [
        { id: 'jess', name: 'jess' },
        { id: 'danish', name: 'danish' },
        { id: 'tingwei', name: 'tingwei' },
        { id: 'david', name: 'david' },
      ];

      const newPoll = new Poll(creator, question, options, { anonymize: true, multiSelect: false });
      addBulkVotes(newPoll, [
        [jess, [0]],
        [danish, [0]],
        [tingwei, [2]],
        [david, [3]],
      ]);

      const pollModel = newPoll.toModel();
      expect(pollModel.responses).toEqual([2, 0, 1, 1]);
    });
  });

  describe('Vote', () => {
    it('Vote works when new user id voting for an option with no votes', () => {
      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[1]).toHaveLength(0);
      expect(testPoll.votes[0]).toHaveLength(0);
      expect(testPoll.votes[2]).toHaveLength(0);
      expect(testPoll.votes[3]).toHaveLength(0);

      const testVoter = { id: '1', name: 'jesssss' };
      const expected = [testVoter];

      testPoll.vote(testVoter, [1]);

      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[0]).toHaveLength(0);
      expect(testPoll.votes[2]).toHaveLength(0);
      expect(testPoll.votes[3]).toHaveLength(0);
      expect(testPoll.votes[1]).toEqual(expected);
    });

    it('Vote works when new user id voting for an option with multiple votes already', () => {
      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[1]).toHaveLength(0);
      expect(testPoll.votes[0]).toHaveLength(0);
      expect(testPoll.votes[2]).toHaveLength(0);
      expect(testPoll.votes[3]).toHaveLength(0);

      const jess = { id: 'jess', name: 'jess' };
      const david = { id: 'david', name: 'danish' };
      const tingwei = { id: 'tingwei', name: 'tingwei' };
      testPoll.votes[0].push(tingwei);
      testPoll.votes[0].push(david);

      const expectedVotes = testPoll.votes.map((item: PlayerPartial[]) =>
        item.map((obj: PlayerPartial) => ({ ...obj })),
      );

      expectedVotes[0].push(jess);

      testPoll.vote(jess, [0]);

      expect(testPoll.votes).toHaveLength(4);
      expect(testPoll.votes[1]).toHaveLength(0);
      expect(testPoll.votes[2]).toHaveLength(0);
      expect(testPoll.votes[3]).toHaveLength(0);
      expect(testPoll.votes[0]).toStrictEqual(expectedVotes[0]);
    });

    it('Cannot vote more than once in a non-anonymous poll', () => {
      const testVoter = { id: '123456789', name: 'jesssss' };
      testPoll.vote(testVoter, [1]);
      expect(() => testPoll.vote(testVoter, [0])).toThrowError();
    });

    it('Cannot vote for an invalid option', () => {
      const testVoter = { id: '123456789', name: 'jesssss' };
      // 5 is out of bounds, only 0-3 are in bounds in this test poll
      expect(() => testPoll.vote(testVoter, [5])).toThrowError();
    });

    it('Cannot vote multiple options in a non-multi-select poll', () => {
      const testVoter = { id: '123456789', name: 'jesssss' };
      // 5 is out of bounds, only 0-3 are in bounds
      expect(() => testPoll.vote(testVoter, [0, 1, 2, 3])).toThrowError();
    });

    it('Cannot vote more than once in a non-multi-select anonymous poll', () => {
      const anonymousPoll = new Poll(
        { id: '123456789', name: 'jesssss' },
        'What is the best CS class?',
        ['CS4530', 'CS3300', 'CS3000', 'CS2500'],
        { anonymize: true, multiSelect: false },
      );
      const testVoter = { id: '123456789', name: 'jesssss' };
      anonymousPoll.vote(testVoter, [1]);
      expect(() => anonymousPoll.vote(testVoter, [0])).toThrowError();
    });

    it('Cannot vote more than once in a multiselect nonanonymous poll', () => {
      const multiSelectPoll = new Poll(
        { id: '123456789', name: 'jesssss' },
        'What is the best CS class?',
        ['CS4530', 'CS3300', 'CS3000', 'CS2500'],
        { anonymize: false, multiSelect: true },
      );
      const testVoter = { id: '123456789', name: 'jesssss' };
      multiSelectPoll.vote(testVoter, [0, 1]);
      expect(() => multiSelectPoll.vote(testVoter, [2])).toThrowError();
    });

    it('Cannot vote more than once in a multiselect, anonymous poll', () => {
      const multiSelectPoll = new Poll(
        { id: '123456789', name: 'jesssss' },
        'What is the best CS class?',
        ['CS4530', 'CS3300', 'CS3000', 'CS2500'],
        { anonymize: true, multiSelect: true },
      );
      const testVoter = { id: '123456789', name: 'jesssss' };
      multiSelectPoll.vote(testVoter, [0, 1]);
      expect(() => multiSelectPoll.vote(testVoter, [2])).toThrowError();
    });

    it('Cannot vote for an invalid option in multi-select poll', () => {
      const multiSelectPoll = new Poll(
        { id: '123456789', name: 'jesssss' },
        'What is the best CS class?',
        ['CS4530', 'CS3300', 'CS3000', 'CS2500'],
        { anonymize: true, multiSelect: true },
      );
      const testVoter = { id: '123456789', name: 'jesssss' };
      // 5 is out of bounds, only 0-3 are in bounds
      expect(() => multiSelectPoll.vote(testVoter, [5, 1])).toThrowError();
    });

    it('getUserVotes returns empty list if user has not voted', () => {
      const testVoter = { id: '123456789', name: 'jesssss' };
      expect(testPoll.getUserVotes(testVoter.id)).toHaveLength(0);
    });

    it('getUserVotes returns indexes of what options the user has voted for', () => {
      const multiSelectPoll = new Poll(
        { id: '123456789', name: 'jesssss' },
        'What is the best CS class?',
        ['CS4530', 'CS3300', 'CS3000', 'CS2500'],
        { anonymize: true, multiSelect: true },
      );
      const testVoter = { id: '123456789', name: 'jesssss' };
      const userVotes = [0, 1];
      expect(multiSelectPoll.getUserVotes(testVoter.id)).toHaveLength(0);

      multiSelectPoll.vote(testVoter, userVotes);
      expect(multiSelectPoll.getUserVotes(testVoter.id)).toStrictEqual(userVotes);
    });
  });
});
