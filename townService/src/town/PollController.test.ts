import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { Interactable, TownEmitter, PosterSessionArea } from '../types/CoveyTownSocket';
import TownsStore from '../lib/TownsStore';
import { getLastEmittedEvent, mockPlayer, MockedPlayer, isPosterSessionArea } from '../TestUtils';
import { TownsController } from './TownsController';

type TestTownData = {
  friendlyName: string;
  townID: string;
  isPubliclyListed: boolean;
  townUpdatePassword: string;
};

const broadcastEmitter = jest.fn();
describe('TownsController integration tests', () => {
  let controller: TownsController;

  const createdTownEmitters: Map<string, DeepMockProxy<TownEmitter>> = new Map();
  async function createTownForTesting(
    friendlyNameToUse?: string,
    isPublic = false,
  ): Promise<TestTownData> {
    const friendlyName =
      friendlyNameToUse !== undefined
        ? friendlyNameToUse
        : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await controller.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
      mapFile: 'testData/indoors.json',
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      townID: ret.townID,
      townUpdatePassword: ret.townUpdatePassword,
    };
  }
  function getBroadcastEmitterForTownID(townID: string) {
    const ret = createdTownEmitters.get(townID);
    if (!ret) {
      throw new Error(`Could not find broadcast emitter for ${townID}`);
    }
    return ret;
  }

  beforeAll(() => {
    // Set the twilio tokens to dummy values so that the unit tests can run
    process.env.TWILIO_API_AUTH_TOKEN = 'testing';
    process.env.TWILIO_ACCOUNT_SID = 'ACtesting';
    process.env.TWILIO_API_KEY_SID = 'testing';
    process.env.TWILIO_API_KEY_SECRET = 'testing';
  });

  beforeEach(async () => {
    createdTownEmitters.clear();
    broadcastEmitter.mockImplementation((townID: string) => {
      const mockRoomEmitter = mockDeep<TownEmitter>();
      createdTownEmitters.set(townID, mockRoomEmitter);
      return mockRoomEmitter;
    });
    TownsStore.initializeTownsStore(broadcastEmitter);
    controller = new TownsController();
  });

  describe('Town Polls', () => {
    let testingTown: TestTownData;
    let player: MockedPlayer;
    let sessionToken: string;
    let interactables: Interactable[];
    beforeEach(async () => {
      testingTown = await createTownForTesting(undefined, true);
      player = mockPlayer(testingTown.townID);
      await controller.joinTown(player.socket);
      const initialData = getLastEmittedEvent(player.socket, 'initialize');
      sessionToken = initialData.sessionToken;
      interactables = initialData.interactables;
    });

    describe('Create polls', () => {
      it('Player can successfully create a poll ', async () => {
        const poll = {
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          settings: { anonymize: false, multiSelect: false },
        };

        const res = await controller.createPoll(testingTown.townID, sessionToken, poll);
        expect(res).toBeDefined();
        expect(res.pollId).not.toHaveLength(0);
      });

      it('Player can successfully create a poll with duplicate options', async () => {
        const poll = {
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Blue'],
          settings: { anonymize: false, multiSelect: false },
        };

        const res = await controller.createPoll(testingTown.townID, sessionToken, poll);
        expect(res).toBeDefined();
        expect(res.pollId).not.toHaveLength(0);
      });

      it('Player can successfully create duplicate polls', async () => {
        const poll = {
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          settings: { anonymize: false, multiSelect: false },
        };
        [1, 2, 3, 4, 5].forEach(async _ => {
          const res = await controller.createPoll(testingTown.townID, sessionToken, poll);
          expect(res).toBeDefined();
          expect(res.pollId).not.toHaveLength(0);
        });
      });

      it('Cannot make a poll with a bad town id', async () => {
        const poll = {
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          settings: { anonymize: false, multiSelect: false },
        };

        await expect(
          controller.createPoll(randomUUID(), sessionToken, poll),
        ).rejects.toThrowError();
      });

      it('Cannot make a poll with a bad sessionToken', async () => {
        const poll = {
          question: 'What is your favorite color?',
          options: ['Red', 'Blue', 'Green'],
          settings: { anonymize: false, multiSelect: false },
        };

        await expect(
          controller.createPoll(testingTown.townID, randomUUID(), poll),
        ).rejects.toThrowError();
      });

      it('Cannot make a poll with less than two options', async () => {
        const poll = {
          question: 'What is your favorite color?',
          options: ['Red'],
          settings: { anonymize: false, multiSelect: false },
        };

        await expect(
          controller.createPoll(testingTown.townID, sessionToken, poll),
        ).rejects.toThrowError();
      });

      it('Cannot make a poll with more than 8 options', async () => {
        const poll = {
          question: 'What is your favorite color?',
          options: [
            'Red',
            'Green',
            'Blue',
            'Yellow',
            'Purple',
            'Orange',
            'Pink',
            'Black',
            'Danish',
          ],
          settings: { anonymize: false, multiSelect: false },
        };

        await expect(
          controller.createPoll(testingTown.townID, sessionToken, poll),
        ).rejects.toThrowError();
      });

      it('Cannot make a poll with an empty question', async () => {
        const poll = {
          question: '',
          options: ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange', 'Pink'],
          settings: { anonymize: false, multiSelect: false },
        };

        await expect(
          controller.createPoll(testingTown.townID, sessionToken, poll),
        ).rejects.toThrowError();
      });

      it('Cannot make a poll with an empty option', async () => {
        const poll = {
          question: 'What is the best color?',
          options: ['Red', 'Green', ''],
          settings: { anonymize: false, multiSelect: false },
        };

        await expect(
          controller.createPoll(testingTown.townID, sessionToken, poll),
        ).rejects.toThrowError();
      });

      it('Cannot make a poll with all empty options', async () => {
        const poll = {
          question: 'What is the best color?',
          options: ['', '', ''],
          settings: { anonymize: false, multiSelect: false },
        };

        await expect(
          controller.createPoll(testingTown.townID, sessionToken, poll),
        ).rejects.toThrowError();
      });
    });
    // describe('Vote', () => {
    //   it('Player can successfully vote in a poll ', async () => {
    //     const poll = {
    //       question: 'What is your favorite color?',
    //       options: ['Red', 'Blue', 'Green'],
    //       settings: { anonymize: false, multiSelect: false },
    //     };

    //     const res = await controller.createPoll(testingTown.townID, sessionToken, poll);
    //     expect(res).toBeDefined();
    //     expect(res.pollId).not.toHaveLength(0);

    //     // const expectedVotes = newPoll.votes.map(item =>
    //     //   item.map(obj => {
    //     //     return {...obj}
    //     //   }))

    //     // expectedVotes[1].push(testVoter)
    //     // town.voteInPoll(newPollId, testVoter, [1])

    //     await controller.voteInPoll(voterID, 1)

    //     expect(res.votes).toHaveLength(3);
    //     expect(res.votes[1]).toHaveLength(1);
    //     expect(res.votes[0]).toHaveLength(0);
    //     expect(res.votes[2]).toHaveLength(0);
    //   });
    // });
  });
});
