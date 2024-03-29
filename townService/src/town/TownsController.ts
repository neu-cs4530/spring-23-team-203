import assert from 'assert';

import {
  Body,
  Controller,
  Delete,
  Example,
  Get,
  Header,
  Patch,
  Path,
  Post,
  Response,
  Route,
  Tags,
} from 'tsoa';

import { Town, TownCreateParams, TownCreateResponse } from '../api/Model';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyTownsStore from '../lib/TownsStore';
import {
  ConversationArea,
  CoveyTownSocket,
  TownSettingsUpdate,
  ViewingArea,
  PosterSessionArea,
  CreatePollRequest,
  CreatePollResponse,
  VoteRequest,
  GetPollResultsResponse,
  PollInfo,
} from '../types/CoveyTownSocket';
import PosterSessionAreaReal from './PosterSessionArea';
import { isPosterSessionArea } from '../TestUtils';

/**
 * This is the town route
 */
@Route('towns')
@Tags('towns')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class TownsController extends Controller {
  private _townsStore: CoveyTownsStore = CoveyTownsStore.getInstance();

  /**
   * List all towns that are set to be publicly available
   *
   * @returns list of towns
   */
  @Get()
  public async listTowns(): Promise<Town[]> {
    return this._townsStore.getTowns();
  }

  /**
   * Create a new town
   *
   * @param request The public-facing information for the new town
   * @example request {"friendlyName": "My testing town public name", "isPubliclyListed": true}
   * @returns The ID of the newly created town, and a secret password that will be needed to update or delete this town.
   */
  @Example<TownCreateResponse>({ townID: 'stringID', townUpdatePassword: 'secretPassword' })
  @Post()
  public async createTown(@Body() request: TownCreateParams): Promise<TownCreateResponse> {
    const { townID, townUpdatePassword } = await this._townsStore.createTown(
      request.friendlyName,
      request.isPubliclyListed,
      request.mapFile,
    );
    return {
      townID,
      townUpdatePassword,
    };
  }

  /**
   * Updates an existing town's settings by ID
   *
   * @param townID  town to update
   * @param townUpdatePassword  town update password, must match the password returned by createTown
   * @param requestBody The updated settings
   */
  @Patch('{townID}')
  @Response<InvalidParametersError>(400, 'Invalid password or update values specified')
  public async updateTown(
    @Path() townID: string,
    @Header('X-CoveyTown-Password') townUpdatePassword: string,
    @Body() requestBody: TownSettingsUpdate,
  ): Promise<void> {
    const success = this._townsStore.updateTown(
      townID,
      townUpdatePassword,
      requestBody.friendlyName,
      requestBody.isPubliclyListed,
    );
    if (!success) {
      throw new InvalidParametersError('Invalid password or update values specified');
    }
  }

  /**
   * Deletes a town
   * @param townID ID of the town to delete
   * @param townUpdatePassword town update password, must match the password returned by createTown
   */
  @Delete('{townID}')
  @Response<InvalidParametersError>(400, 'Invalid password or update values specified')
  public async deleteTown(
    @Path() townID: string,
    @Header('X-CoveyTown-Password') townUpdatePassword: string,
  ): Promise<void> {
    const success = this._townsStore.deleteTown(townID, townUpdatePassword);
    if (!success) {
      throw new InvalidParametersError('Invalid password or update values specified');
    }
  }

  /**
   * Creates a conversation area in a given town
   * @param townID ID of the town in which to create the new conversation area
   * @param sessionToken session token of the player making the request, must match the session token returned when the player joined the town
   * @param requestBody The new conversation area to create
   */
  @Post('{townID}/conversationArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createConversationArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: ConversationArea,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town?.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid values specified');
    }
    const success = town.addConversationArea(requestBody);
    if (!success) {
      throw new InvalidParametersError('Invalid values specified');
    }
  }

  /**
   * Creates a viewing area in a given town
   *
   * @param townID ID of the town in which to create the new viewing area
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody The new viewing area to create
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          viewing area could not be created
   */
  @Post('{townID}/viewingArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createViewingArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: ViewingArea,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    if (!town?.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid values specified');
    }
    const success = town.addViewingArea(requestBody);
    if (!success) {
      throw new InvalidParametersError('Invalid values specified');
    }
  }

  /**
   * Creates a poster session area in a given town
   *
   * @param townID ID of the town in which to create the new poster session area
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody The new poster session area to create
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session area could not be created
   */
  @Post('{townID}/posterSessionArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createPosterSessionArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: PosterSessionArea,
  ): Promise<void> {
    // download file here TODO
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    // add viewing area to the town, throw error if it fails
    if (!curTown.addPosterSessionArea(requestBody)) {
      throw new InvalidParametersError('Invalid poster session area');
    }
  }

  /**
   * Gets the image contents of a given poster session area in a given town
   *
   * @param townID ID of the town in which to get the poster session area image contents
   * @param posterSessionId interactable ID of the poster session
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session specified does not exist
   */
  @Patch('{townID}/{posterSessionId}/imageContents')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async getPosterAreaImageContents(
    @Path() townID: string,
    @Path() posterSessionId: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<string | undefined> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const posterSessionArea = curTown.getInteractable(posterSessionId);
    if (!posterSessionArea || !isPosterSessionArea(posterSessionArea)) {
      throw new InvalidParametersError('Invalid poster session ID');
    }
    return posterSessionArea.imageContents;
  }

  /**
   * Increment the stars of a given poster session area in a given town, as long as there is
   * a poster image. Returns the new number of stars.
   *
   * @param townID ID of the town in which to get the poster session area image contents
   * @param posterSessionId interactable ID of the poster session
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session specified does not exist, or if the poster session specified
   *          does not have an image
   */
  @Patch('{townID}/{posterSessionId}/incStars')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async incrementPosterAreaStars(
    @Path() townID: string,
    @Path() posterSessionId: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<number> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const posterSessionArea = curTown.getInteractable(posterSessionId);
    if (!posterSessionArea || !isPosterSessionArea(posterSessionArea)) {
      throw new InvalidParametersError('Invalid poster session ID');
    }
    if (!posterSessionArea.imageContents) {
      throw new InvalidParametersError('Cant star a poster with no image');
    }
    const newStars = posterSessionArea.stars + 1;
    const updatedPosterSessionArea = {
      id: posterSessionArea.id,
      imageContents: posterSessionArea.imageContents,
      title: posterSessionArea.title,
      stars: newStars, // increment stars
    };
    (<PosterSessionAreaReal>posterSessionArea).updateModel(updatedPosterSessionArea);
    return newStars;
  }

  /**
   * Creates a poll in the town.
   *
   * @param townID ID of the town to add the poll to
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody the information for the create poll request
   * @returns a promise wrapping the id of the poll you just created
   */
  @Post('{townID}/polls/create')
  public async createPoll(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: CreatePollRequest,
  ): Promise<CreatePollResponse> {
    // ensures the town ID is valid
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }

    // ensures the player can be retrieved from the session token
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid session ID');
    }

    // extract the parameters needed from the request
    const creator = { id: player.id, name: player.userName };
    const { question, options, settings } = requestBody;
    // ensure the question and options are valid
    if (question.length === 0 || options.some(opt => opt.length === 0)) {
      throw new InvalidParametersError('Question and options must not be empty');
    }
    // ensure the options are the right amount, between 2 and 8 inclusive
    if (options.length < 2 || options.length > 8) {
      throw new InvalidParametersError('Number of options must be between 2 and 8');
    }
    const pollId = curTown.createPoll(creator, question, options, settings);
    return { pollId };
  }

  /**
   * Gets all polls in the town.
   *
   * @param townID ID of the town to get the polls for
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @returns a promise wrapping information about all polls in the town
   */
  @Get('{townID}/polls')
  public async getAllPolls(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<PollInfo[]> {
    // ensures the town ID is valid
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    // ensures the player can be retrieved from the session token
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid session ID');
    }

    const userID = player.id;

    return curTown.getAllPolls(userID);
  }

  /**
   * Vote for a poll in the town.
   *
   * @param townID ID of the town you are in
   * @param pollID ID of the poll you are voting in
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody information about your vote
   *
   * @throws InvalidParametersError if the session token is not valid, the user has
   *          already voted, the option is not found, or the poll is not found
   */
  @Post('{townID}/polls/{pollID}/vote')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async voteInPoll(
    @Path() townID: string,
    @Path() pollID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: VoteRequest,
  ): Promise<void> {
    // ensures the town ID is valid
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    // ensures the player can be retrieved from the session token
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid session ID');
    }

    // extract the parameters needed from the request
    const voter = { id: player.id, name: player.userName };
    const { userVotes } = requestBody;
    // validation of userVotes takes place in the vote method on the Poll class
    curTown.voteInPoll(pollID, voter, userVotes);
  }

  /**
   * Gets the results of a poll in the town.
   *
   * @param townID ID of the town
   * @param pollID ID of the poll to get results for
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @returns a promise wrapping the results of the poll
   *
   * @throws InvalidParametersError if the session token is not valid, the user has
   *          not voted yet, or the poll with pollId is not found
   */
  @Get('{townID}/polls/{pollID}')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async getPollResults(
    @Path() townID: string,
    @Path() pollID: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<GetPollResultsResponse> {
    // ensures the town ID is valid
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    // ensures the player can be retrieved from the session token
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid session ID');
    }

    // ensures the poll ID is valid
    let poll;
    try {
      poll = curTown.getPoll(pollID);
    } catch (e) {
      throw new InvalidParametersError('Invalid poll ID');
    }

    return Object.assign(poll.toModel(), {
      userVotes: poll.getUserVotes(player.id),
    });
  }

  /**
   * Deletes a poll in the town.
   *
   * @param townID ID of the town
   * @param pollID ID of the poll to delete
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   *
   * @throws InvalidParametersError if the session token is not valid, the poll with
   *          pollID is not found, or the user is not the poll creator
   */
  @Delete('{townID}/polls/{pollID}')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async deletePoll(
    @Path() townID: string,
    @Path() pollID: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<void> {
    // ensures the town ID is valid
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    // ensures the player can be retrieved from the session token
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid session ID');
    }

    const userID = player.id;

    try {
      curTown.deletePoll(userID, pollID);
    } catch (e) {
      throw new InvalidParametersError((e as Error).message);
    }
  }

  /**
   * Connects a client's socket to the requested town, or disconnects the socket if no such town exists
   *
   * @param socket A new socket connection, with the userName and townID parameters of the socket's
   * auth object configured with the desired townID to join and username to use
   *
   */
  public async joinTown(socket: CoveyTownSocket) {
    // Parse the client's requested username from the connection
    const { userName, townID } = socket.handshake.auth as { userName: string; townID: string };

    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      socket.disconnect(true);
      return;
    }

    // Connect the client to the socket.io broadcast room for this town
    socket.join(town.townID);

    const newPlayer = await town.addPlayer(userName, socket);
    assert(newPlayer.videoToken);
    socket.emit('initialize', {
      userID: newPlayer.id,
      sessionToken: newPlayer.sessionToken,
      providerVideoToken: newPlayer.videoToken,
      currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
      friendlyName: town.friendlyName,
      isPubliclyListed: town.isPubliclyListed,
      interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
    });
  }
}
