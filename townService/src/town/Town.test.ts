import { ITiledMap } from '@jonbell/tiled-map-type-guard';
import { DeepMockProxy, mockClear, mockDeep, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import {
  ClientEventTypes,
  expectArraysToContainSameMembers,
  getEventListener,
  getLastEmittedEvent,
  MockedPlayer,
  mockPlayer,
} from '../TestUtils';
import {
  ChatMessage,
  Interactable,
  PlayerLocation,
  PollSettings,
  TownEmitter,
  ViewingArea as ViewingAreaModel,
  PollInfo,
} from '../types/CoveyTownSocket';
import ConversationArea from './ConversationArea';
import Town from './Town';
import Poll from './Poll';

const mockTwilioVideo = mockDeep<TwilioVideo>();
jest.spyOn(TwilioVideo, 'getInstance').mockReturnValue(mockTwilioVideo);

type TestMapDict = {
  [key in string]: ITiledMap;
};
const testingMaps: TestMapDict = {
  twoConv: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  overlapping: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 40,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  noObjects: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [],
  },
  duplicateNames: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ViewingArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoPosters: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'PosterSessionArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'PosterSessionArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvOneViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvOnePoster: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'PosterSessionArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'imageContents',
                type: 'string',
                value: 'placeholder file contents',
              },
              {
                name: 'title',
                type: 'string',
                value: 'test title',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvTwoViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 55,
            name: 'Name4',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 600,
            y: 1200,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
};

describe('Town', () => {
  const townEmitter: DeepMockProxy<TownEmitter> = mockDeep<TownEmitter>();
  let town: Town;
  let player: Player;
  let playerTestData: MockedPlayer;

  beforeEach(async () => {
    town = new Town(nanoid(), false, nanoid(), townEmitter);
    playerTestData = mockPlayer(town.townID);
    player = await town.addPlayer(playerTestData.userName, playerTestData.socket);
    playerTestData.player = player;
    // Set this dummy player to be off the map so that they do not show up in conversation areas
    playerTestData.moveTo(-1, -1);

    mockReset(townEmitter);
  });

  it('constructor should set its properties', () => {
    const townName = `FriendlyNameTest-${nanoid()}`;
    const townID = nanoid();
    const testTown = new Town(townName, true, townID, townEmitter);
    expect(testTown.friendlyName).toBe(townName);
    expect(testTown.townID).toBe(townID);
    expect(testTown.isPubliclyListed).toBe(true);
  });
  describe('addPlayer', () => {
    it('should use the townID and player ID properties when requesting a video token', async () => {
      const newPlayer = mockPlayer(town.townID);
      mockTwilioVideo.getTokenForTown.mockClear();
      const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);

      expect(mockTwilioVideo.getTokenForTown).toBeCalledTimes(1);
      expect(mockTwilioVideo.getTokenForTown).toBeCalledWith(town.townID, newPlayerObj.id);
    });
    it('should register callbacks for all client-to-server events', () => {
      const expectedEvents: ClientEventTypes[] = [
        'disconnect',
        'chatMessage',
        'playerMovement',
        'interactableUpdate',
      ];
      expectedEvents.forEach(eachEvent =>
        expect(getEventListener(playerTestData.socket, eachEvent)).toBeDefined(),
      );
    });
    describe('[T1] interactableUpdate callback', () => {
      let interactableUpdateHandler: (update: Interactable) => void;
      beforeEach(() => {
        town.initializeFromMap(testingMaps.twoConvTwoViewing);
        interactableUpdateHandler = getEventListener(playerTestData.socket, 'interactableUpdate');
      });
      it('Should not throw an error for any interactable area that is not a viewing area', () => {
        expect(() =>
          interactableUpdateHandler({ id: 'Name1', topic: nanoid(), occupantsByID: [] }),
        ).not.toThrowError();
      });
      it('Should not throw an error if there is no such viewing area', () => {
        expect(() =>
          interactableUpdateHandler({
            id: 'NotActuallyAnInteractable',
            topic: nanoid(),
            occupantsByID: [],
          }),
        ).not.toThrowError();
      });
      describe('When called passing a valid viewing area', () => {
        let newArea: ViewingAreaModel;
        let secondPlayer: MockedPlayer;
        beforeEach(async () => {
          newArea = {
            id: 'Name4',
            elapsedTimeSec: 0,
            isPlaying: true,
            video: nanoid(),
          };
          expect(town.addViewingArea(newArea)).toBe(true);
          secondPlayer = mockPlayer(town.townID);
          mockTwilioVideo.getTokenForTown.mockClear();
          await town.addPlayer(secondPlayer.userName, secondPlayer.socket);

          newArea.elapsedTimeSec = 100;
          newArea.isPlaying = false;
          mockClear(townEmitter);

          mockClear(secondPlayer.socket);
          mockClear(secondPlayer.socketToRoomMock);
          interactableUpdateHandler(newArea);
        });
        it("Should emit the interactable update to the other players in the town using the player's townEmitter, after the viewing area was successfully created", () => {
          const updatedArea = town.getInteractable(newArea.id);
          expect(updatedArea.toModel()).toEqual(newArea);
        });
        it('Should update the model for the viewing area', () => {
          const lastUpdate = getLastEmittedEvent(
            playerTestData.socketToRoomMock,
            'interactableUpdate',
          );
          expect(lastUpdate).toEqual(newArea);
        });
        it('Should not emit interactableUpdate events to players directly, or to the whole town', () => {
          expect(() =>
            getLastEmittedEvent(playerTestData.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() => getLastEmittedEvent(townEmitter, 'interactableUpdate')).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socketToRoomMock, 'interactableUpdate'),
          ).toThrowError();
        });
      });
    });
  });
  describe('Socket event listeners created in addPlayer', () => {
    describe('on socket disconnect', () => {
      function disconnectPlayer(playerToLeave: MockedPlayer) {
        // Call the disconnect event handler
        const disconnectHandler = getEventListener(playerToLeave.socket, 'disconnect');
        disconnectHandler('unknown');
      }
      it("Invalidates the players's session token", async () => {
        const token = player.sessionToken;

        expect(town.getPlayerBySessionToken(token)).toBe(player);
        disconnectPlayer(playerTestData);

        expect(town.getPlayerBySessionToken(token)).toEqual(undefined);
      });
      it('Informs all other players of the disconnection using the broadcast emitter', () => {
        const playerToLeaveID = player.id;

        disconnectPlayer(playerTestData);
        const callToDisconnect = getLastEmittedEvent(townEmitter, 'playerDisconnect');
        expect(callToDisconnect.id).toEqual(playerToLeaveID);
      });
      it('Removes the player from any active conversation area', () => {
        // Load in a map with a conversation area
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(45, 122); // Inside of "Name1" area
        expect(
          town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] }),
        ).toBeTruthy();
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.occupantsByID).toEqual([player.id]);
        disconnectPlayer(playerTestData);
        expect(convArea.occupantsByID).toEqual([]);
        expect(town.occupancy).toBe(0);
      });

      it('Removes the player from any active viewing area', () => {
        // Load in a map with a conversation area
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(156, 567); // Inside of "Name3" area
        expect(
          town.addViewingArea({ id: 'Name3', isPlaying: true, elapsedTimeSec: 0, video: nanoid() }),
        ).toBeTruthy();
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.occupantsByID).toEqual([player.id]);
        disconnectPlayer(playerTestData);
        expect(viewingArea.occupantsByID).toEqual([]);
      });

      it('Removes polls created by the player on disconnect', async () => {
        // Load in a map with a conversation area
        town.initializeFromMap(testingMaps.twoConvOneViewing);

        const secondPlayerTestData = mockPlayer(town.townID);
        const secondPlayer = await town.addPlayer(playerTestData.userName, playerTestData.socket);
        secondPlayerTestData.player = secondPlayer;

        const whichLetterPollId = town.createPoll(
          { id: player.id, name: player.userName },
          'which letter is best?',
          ['a', 'b', 'c'],
          { anonymize: false, multiSelect: false },
        );

        const beanPollId = town.createPoll(
          { id: secondPlayer.id, name: secondPlayer.userName },
          'which bean is best?',
          ['fava', 'kidney', 'refried'],
          { anonymize: false, multiSelect: false },
        );

        const yesNo = town.createPoll(
          { id: secondPlayer.id, name: secondPlayer.userName },
          'yes or no?',
          ['yes', 'no'],
          { anonymize: false, multiSelect: false },
        );

        town.voteInPoll(whichLetterPollId, { id: player.id, name: player.userName }, [0]);
        town.voteInPoll(whichLetterPollId, { id: secondPlayer.id, name: secondPlayer.userName }, [
          1,
        ]);

        town.voteInPoll(beanPollId, { id: player.id, name: player.userName }, [1]);
        town.voteInPoll(beanPollId, { id: secondPlayer.id, name: secondPlayer.userName }, [2]);

        // Disconnect the first player and make sure the poll they created is gone
        expect(town.getAllPolls(secondPlayer.id)).toHaveLength(3);
        disconnectPlayer(playerTestData);
        expect(town.getAllPolls(secondPlayer.id)).toHaveLength(2);
        expect(town.getAllPolls(secondPlayer.id).map(p => p.pollId)).toEqual([beanPollId, yesNo]);

        // Ensure that votes from the first player are still present
        expect(
          town
            .getPoll(beanPollId)
            .getVoters()
            .map(pp => pp.id),
        ).toStrictEqual([player.id, secondPlayer.id]);
      });
    });

    describe('playerMovement', () => {
      const newLocation: PlayerLocation = {
        x: 100,
        y: 100,
        rotation: 'back',
        moving: true,
      };

      beforeEach(() => {
        playerTestData.moveTo(
          newLocation.x,
          newLocation.y,
          newLocation.rotation,
          newLocation.moving,
        );
      });

      it('Emits a playerMoved event', () => {
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.id).toEqual(playerTestData.player?.id);
        expect(lastEmittedMovement.location).toEqual(newLocation);
      });
      it("Updates the player's location", () => {
        expect(player.location).toEqual(newLocation);
      });
    });
    describe('interactableUpdate', () => {
      let interactableUpdateCallback: (update: Interactable) => void;
      let update: ViewingAreaModel;
      beforeEach(async () => {
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(156, 567); // Inside of "Name3" viewing area
        interactableUpdateCallback = getEventListener(playerTestData.socket, 'interactableUpdate');
        update = {
          id: 'Name3',
          isPlaying: true,
          elapsedTimeSec: 100,
          video: nanoid(),
        };
        interactableUpdateCallback(update);
      });
      it('forwards updates to others in the town', () => {
        const lastEvent = getLastEmittedEvent(
          playerTestData.socketToRoomMock,
          'interactableUpdate',
        );
        expect(lastEvent).toEqual(update);
      });
      it('does not forward updates to the ENTIRE town', () => {
        expect(
          // getLastEmittedEvent will throw an error if no event was emitted, which we expect to be the case here
          () => getLastEmittedEvent(townEmitter, 'interactableUpdate'),
        ).toThrowError();
      });
      it('updates the local model for that interactable', () => {
        const interactable = town.getInteractable(update.id);
        expect(interactable?.toModel()).toEqual(update);
      });
    });
    it('[OMG1 chatMessage] Forwards chat messages to players with the same ID as the message ID', async () => {
      const chatHandler = getEventListener(playerTestData.socket, 'chatMessage');
      const chatMessage: ChatMessage = {
        author: player.id,
        body: 'Test message',
        dateCreated: new Date(),
        sid: 'test message id',
        interactableId: player.location?.interactableID,
      };

      chatHandler(chatMessage);

      const emittedMessage = getLastEmittedEvent(playerTestData.socket, 'chatMessage');
      expect(emittedMessage).toEqual(chatMessage);
    });
    it('Does not forward chat messages to players if the message ID doesnt match the player area', async () => {
      const chatHandler = getEventListener(playerTestData.socket, 'chatMessage');
      const chatMessage: ChatMessage = {
        author: player.id,
        body: 'Test message',
        dateCreated: new Date(),
        sid: 'test message id',
        interactableId: 'random id',
      };

      chatHandler(chatMessage);

      expect(() => {
        getLastEmittedEvent(playerTestData.socket, 'chatMessage');
      }).toThrowError();
    });
  });
  describe('addConversationArea', () => {
    beforeEach(async () => {
      town.initializeFromMap(testingMaps.twoConvOneViewing);
    });
    it('Should return false if no area exists with that ID', () => {
      expect(
        town.addConversationArea({ id: nanoid(), topic: nanoid(), occupantsByID: [] }),
      ).toEqual(false);
    });
    it('Should return false if the requested topic is empty', () => {
      expect(town.addConversationArea({ id: 'Name1', topic: '', occupantsByID: [] })).toEqual(
        false,
      );
      expect(
        town.addConversationArea({ id: 'Name1', topic: undefined, occupantsByID: [] }),
      ).toEqual(false);
    });
    it('Should return false if the area already has a topic', () => {
      expect(
        town.addConversationArea({ id: 'Name1', topic: 'new topic', occupantsByID: [] }),
      ).toEqual(true);
      expect(
        town.addConversationArea({ id: 'Name1', topic: 'new new topic', occupantsByID: [] }),
      ).toEqual(false);
    });
    describe('When successful', () => {
      const newTopic = 'new topic';
      beforeEach(() => {
        playerTestData.moveTo(45, 122); // Inside of "Name1" area
        expect(
          town.addConversationArea({ id: 'Name1', topic: newTopic, occupantsByID: [] }),
        ).toEqual(true);
      });
      it('Should update the local model for that area', () => {
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.topic).toEqual(newTopic);
      });
      it('Should include any players in that area as occupants', () => {
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.occupantsByID).toEqual([player.id]);
      });
      it('Should emit an interactableUpdate message', () => {
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual({
          id: 'Name1',
          topic: newTopic,
          occupantsByID: [player.id],
        });
      });
    });
  });
  describe('[T1] addViewingArea', () => {
    beforeEach(async () => {
      town.initializeFromMap(testingMaps.twoConvOneViewing);
    });
    it('Should return false if no area exists with that ID', () => {
      expect(
        town.addViewingArea({ id: nanoid(), isPlaying: false, elapsedTimeSec: 0, video: nanoid() }),
      ).toBe(false);
    });
    it('Should return false if the requested video is empty', () => {
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: '' }),
      ).toBe(false);
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: undefined }),
      ).toBe(false);
    });
    it('Should return false if the area is already active', () => {
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test' }),
      ).toBe(true);
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test2' }),
      ).toBe(false);
    });
    describe('When successful', () => {
      const newModel: ViewingAreaModel = {
        id: 'Name3',
        isPlaying: true,
        elapsedTimeSec: 100,
        video: nanoid(),
      };
      beforeEach(() => {
        playerTestData.moveTo(160, 570); // Inside of "Name3" area
        expect(town.addViewingArea(newModel)).toBe(true);
      });

      it('Should update the local model for that area', () => {
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.toModel()).toEqual(newModel);
      });

      it('Should emit an interactableUpdate message', () => {
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual(newModel);
      });
      it('Should include any players in that area as occupants', () => {
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.occupantsByID).toEqual([player.id]);
      });
    });
  });

  describe('disconnectAllPlayers', () => {
    beforeEach(() => {
      town.disconnectAllPlayers();
    });
    it('Should emit the townClosing event', () => {
      getLastEmittedEvent(townEmitter, 'townClosing'); // Throws an error if no event existed
    });
    it("Should disconnect each players's socket", () => {
      expect(playerTestData.socket.disconnect).toBeCalledWith(true);
    });
  });
  describe('[OMG4 initializeFromMap]', () => {
    const expectInitializingFromMapToThrowError = (map: ITiledMap) => {
      expect(() => town.initializeFromMap(map)).toThrowError();
    };
    it('Throws an error if there is no layer called "objects"', async () => {
      expectInitializingFromMapToThrowError(testingMaps.noObjects);
    });
    it('Throws an error if there are duplicate interactable object IDs', async () => {
      expectInitializingFromMapToThrowError(testingMaps.duplicateNames);
    });
    it('Throws an error if there are overlapping objects', async () => {
      expectInitializingFromMapToThrowError(testingMaps.overlapping);
    });
    it('Creates a ConversationArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoConv);
      const conv1 = town.getInteractable('Name1');
      const conv2 = town.getInteractable('Name2');
      expect(conv1.id).toEqual('Name1');
      expect(conv1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(conv2.id).toEqual('Name2');
      expect(conv2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    it('Creates a ViewingArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoViewing);
      const viewingArea1 = town.getInteractable('Name1');
      const viewingArea2 = town.getInteractable('Name2');
      expect(viewingArea1.id).toEqual('Name1');
      expect(viewingArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(viewingArea2.id).toEqual('Name2');
      expect(viewingArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    it('Creates a PosterSessionArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoPosters);
      const posterSessionArea1 = town.getInteractable('Name1');
      const posterSessionArea2 = town.getInteractable('Name2');
      expect(posterSessionArea1.id).toEqual('Name1');
      expect(posterSessionArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(posterSessionArea2.id).toEqual('Name2');
      expect(posterSessionArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    describe('Updating interactable state in playerMovements', () => {
      beforeEach(async () => {
        town.initializeFromMap(testingMaps.twoConvOnePoster);
        playerTestData.moveTo(51, 121);
        expect(town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] })).toBe(
          true,
        );
      });
      it('Adds a player to a new interactable and sets their conversation label, if they move into it', async () => {
        const newPlayer = mockPlayer(town.townID);
        const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
        newPlayer.moveTo(51, 121);

        // Check that the player's location was updated
        expect(newPlayerObj.location.interactableID).toEqual('Name1');

        // Check that a movement event was emitted with the correct label
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.location.interactableID).toEqual('Name1');

        // Check that the conversation area occupants was updated
        const occupants = town.getInteractable('Name1').occupantsByID;
        expectArraysToContainSameMembers(occupants, [newPlayerObj.id, player.id]);
      });
      it('Removes a player from their prior interactable and sets their conversation label, if they moved outside of it', () => {
        expect(player.location.interactableID).toEqual('Name1');
        playerTestData.moveTo(0, 0);
        expect(player.location.interactableID).toBeUndefined();
      });
    });
  });
  describe('Updating town settings', () => {
    it('Emits townSettingsUpdated events when friendlyName changes', async () => {
      const newFriendlyName = nanoid();
      town.friendlyName = newFriendlyName;
      expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
        friendlyName: newFriendlyName,
      });
    });
    it('Emits townSettingsUpdated events when isPubliclyListed changes', async () => {
      const expected = !town.isPubliclyListed;
      town.isPubliclyListed = expected;
      expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
        isPubliclyListed: expected,
      });
    });
  });

  describe('Polls', () => {
    describe('Getting a poll', () => {
      it('Throws error if the poll does not exist', async () => {
        expect(() => town.getPoll('does not exist')).toThrowError();
      });

      it('Returns the poll if it exists', async () => {
        const testQuestion = 'What?';
        const testCreator = { id: 'Jess', name: 'Jessssss' };
        const testOptions: string[] = ['because', 'yes', 'no'];

        const testSettings = {
          anonymize: true,
          multiSelect: false,
        };
        const newPollId = town.createPoll(testCreator, testQuestion, testOptions, testSettings);
        const newPoll = town.getPoll(newPollId);
        expect(town.getPoll(newPollId)).toStrictEqual(newPoll);
      });
    });

    describe('Get All Polls', () => {
      const testQuestion1 = 'What?';
      const testCreator1 = { id: 'Jess', name: 'Jessssss' };
      const testOptions1: string[] = ['because', 'yes', 'no'];
      const testSettings1 = {
        anonymize: true,
        multiSelect: false,
      };

      const testQuestion2 = 'Why?';
      const testCreator2 = { id: 'dvd', name: 'David' };
      const testOptions2: string[] = ['because', 'reasons'];
      const testSettings2 = {
        anonymize: false,
        multiSelect: true,
      };
      let poll1: string;
      let poll2: string;

      let expectedPollInfo1: PollInfo;
      let expectedPollInfo2: PollInfo;

      beforeEach(async () => {
        poll1 = town.createPoll(testCreator1, testQuestion1, testOptions1, testSettings1);
        poll2 = town.createPoll(testCreator2, testQuestion2, testOptions2, testSettings2);

        expectedPollInfo1 = {
          pollId: poll1,
          creatorId: testCreator1.id,
          creatorName: testCreator1.name,
          question: testQuestion1,
          options: testOptions1,
          voted: false,
          totalVoters: 0,
        };

        expectedPollInfo2 = {
          pollId: poll2,
          creatorId: testCreator2.id,
          creatorName: testCreator2.name,
          question: testQuestion2,
          options: testOptions2,
          voted: false,
          totalVoters: 0,
        };
      });
      it('Successfully get all active polls', async () => {
        expect(town.getAllPolls('randomPlayer')).toStrictEqual([
          expectedPollInfo1,
          expectedPollInfo2,
        ]);
      });

      it('Correctly display the voted field', async () => {
        const testVoter1 = { id: 'voter1', name: 'Jess' };
        const testVoter2 = { id: 'voter2', name: 'David' };
        const testVoter3 = { id: 'voter3', name: 'Danish' };

        expect(town.getAllPolls(testVoter3.id)).toStrictEqual([
          expectedPollInfo1,
          expectedPollInfo2,
        ]);

        town.voteInPoll(poll2, testVoter2, [1]);
        expectedPollInfo2.voted = true;
        expectedPollInfo2.totalVoters += 1;
        expect(town.getAllPolls(testVoter2.id)).toStrictEqual([
          expectedPollInfo1,
          expectedPollInfo2,
        ]);

        town.voteInPoll(poll1, testVoter1, [1]);
        town.voteInPoll(poll2, testVoter1, [0]);
        expectedPollInfo1.voted = true;
        expectedPollInfo1.totalVoters += 1;
        expectedPollInfo2.totalVoters += 1;

        expect(town.getAllPolls(testVoter1.id)).toStrictEqual([
          expectedPollInfo1,
          expectedPollInfo2,
        ]);
      });
    });

    describe('Delete a poll', () => {
      const testQuestion = 'What?';
      const testCreator = { id: 'Jess', name: 'Jessssss' };
      const testOptions: string[] = ['because', 'yes', 'no'];
      let testSettings: PollSettings;
      let newPollId: string;
      let newPoll: Poll;

      beforeEach(async () => {
        testSettings = {
          anonymize: true,
          multiSelect: false,
        };
        newPollId = town.createPoll(testCreator, testQuestion, testOptions, testSettings);
        newPoll = town.getPoll(newPollId);

        mockReset(townEmitter);
      });

      it('Throws error if the poll does not exist', async () => {
        expect(() => town.deletePoll(testCreator.id, 'non-existing poll')).toThrowError();
      });

      it('Throws error if the user is not the creator of the poll', async () => {
        expect(() => town.deletePoll('not-the-creator', newPollId)).toThrowError();
      });

      it('Creator can delete the poll if it exists', async () => {
        // poll exists before the deletion
        expect(town.getPoll(newPollId)).toStrictEqual(newPoll);
        // delete the poll
        town.deletePoll(testCreator.id, newPollId);
        // poll no longer exists in town
        expect(() => town.getPoll(newPollId)).toThrowError();
      });
    });

    describe('Voting', () => {
      const testQuestion = 'What?';
      const testCreator = { id: 'Jess', name: 'Jessssss' };
      const testOptions: string[] = ['because', 'yes', 'no'];
      let testSettings: PollSettings;
      let newPollId: string;
      let newPoll: Poll;

      beforeEach(async () => {
        testSettings = {
          anonymize: true,
          multiSelect: false,
        };
        newPollId = town.createPoll(testCreator, testQuestion, testOptions, testSettings);
        newPoll = town.getPoll(newPollId);

        mockReset(townEmitter);
      });

      it('Voting in a poll changes the poll', async () => {
        const testVoter = { id: 'voter id', name: 'Jess' };
        const expectedVotes = newPoll.votes.map(item => item.map(obj => ({ ...obj })));

        expectedVotes[1].push(testVoter);
        town.voteInPoll(newPollId, testVoter, [1]);
        expect(town.getPoll(newPollId).votes).toEqual(expectedVotes);
      });

      it('Voting in a poll with an out of bounds option throws error', async () => {
        const testVoterId = { id: 'voter id', name: 'voter id' };

        expect(() => town.voteInPoll(newPollId, testVoterId, [6])).toThrowError();
      });
    });
  });
});
