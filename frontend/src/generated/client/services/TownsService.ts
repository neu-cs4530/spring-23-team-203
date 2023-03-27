/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConversationArea } from '../models/ConversationArea';
import type { CreatePollRequest } from '../models/CreatePollRequest';
import type { CreatePollResponse } from '../models/CreatePollResponse';
import type { GetAllPollsResponseItem } from '../models/GetAllPollsResponseItem';
import type { GetPollResultsResponse } from '../models/GetPollResultsResponse';
import type { PosterSessionArea } from '../models/PosterSessionArea';
import type { Town } from '../models/Town';
import type { TownCreateParams } from '../models/TownCreateParams';
import type { TownCreateResponse } from '../models/TownCreateResponse';
import type { TownSettingsUpdate } from '../models/TownSettingsUpdate';
import type { ViewingArea } from '../models/ViewingArea';
import type { VoteRequest } from '../models/VoteRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TownsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * List all towns that are set to be publicly available
     * @returns Town list of towns
     * @throws ApiError
     */
    public listTowns(): CancelablePromise<Array<Town>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns',
        });
    }

    /**
     * Create a new town
     * @param requestBody The public-facing information for the new town
     * @returns TownCreateResponse The ID of the newly created town, and a secret password that will be needed to update or delete this town.
     * @throws ApiError
     */
    public createTown(
        requestBody: TownCreateParams,
    ): CancelablePromise<TownCreateResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Updates an existing town's settings by ID
     * @param townId town to update
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @param requestBody The updated settings
     * @returns void
     * @throws ApiError
     */
    public updateTown(
        townId: string,
        xCoveyTownPassword: string,
        requestBody: TownSettingsUpdate,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Deletes a town
     * @param townId ID of the town to delete
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @returns void
     * @throws ApiError
     */
    public deleteTown(
        townId: string,
        xCoveyTownPassword: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Creates a conversation area in a given town
     * @param townId ID of the town in which to create the new conversation area
     * @param xSessionToken session token of the player making the request, must match the session token returned when the player joined the town
     * @param requestBody The new conversation area to create
     * @returns void
     * @throws ApiError
     */
    public createConversationArea(
        townId: string,
        xSessionToken: string,
        requestBody: ConversationArea,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/conversationArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a viewing area in a given town
     * @param townId ID of the town in which to create the new viewing area
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @param requestBody The new viewing area to create
     * @returns void
     * @throws ApiError
     */
    public createViewingArea(
        townId: string,
        xSessionToken: string,
        requestBody: ViewingArea,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/viewingArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a poster session area in a given town
     * @param townId ID of the town in which to create the new poster session area
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @param requestBody The new poster session area to create
     * @returns void
     * @throws ApiError
     */
    public createPosterSessionArea(
        townId: string,
        xSessionToken: string,
        requestBody: PosterSessionArea,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/posterSessionArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the image contents of a given poster session area in a given town
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @returns string Ok
     * @throws ApiError
     */
    public getPosterAreaImageContents(
        townId: string,
        posterSessionId: string,
        xSessionToken: string,
    ): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/imageContents',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Increment the stars of a given poster session area in a given town, as long as there is
     * a poster image. Returns the new number of stars.
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @returns number Ok
     * @throws ApiError
     */
    public incrementPosterAreaStars(
        townId: string,
        posterSessionId: string,
        xSessionToken: string,
    ): CancelablePromise<number> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/incStars',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a poll in the town.
     * @param townId ID of the town to add the poll to
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @param requestBody the information for the create poll request
     * @returns CreatePollResponse a promise wrapping the id of the poll you just created
     * @throws ApiError
     */
    public createPoll(
        townId: string,
        xSessionToken: string,
        requestBody: CreatePollRequest,
    ): CancelablePromise<CreatePollResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/polls/create',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Gets all polls in the town.
     * @param townId ID of the town to get the polls for
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @returns GetAllPollsResponseItem a promise wrapping information about all polls in the town
     * @throws ApiError
     */
    public getAllPolls(
        townId: string,
        xSessionToken: string,
    ): CancelablePromise<Array<GetAllPollsResponseItem>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns/{townID}/polls',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
        });
    }

    /**
     * Vote for a poll in the town.
     * @param townId ID of the town you are in
     * @param pollId ID of the poll you are voting in
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @param requestBody information about your vote
     * @returns void
     * @throws ApiError
     */
    public voteInPoll(
        townId: string,
        pollId: string,
        xSessionToken: string,
        requestBody: VoteRequest,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/polls/{pollID}/vote',
            path: {
                'townID': townId,
                'pollID': pollId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the results of a poll in the town.
     * @param townId ID of the town
     * @param pollId ID of the poll to get results for
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @returns GetPollResultsResponse a promise wrapping the results of the poll
     * @throws ApiError
     */
    public getPollResults(
        townId: string,
        pollId: string,
        xSessionToken: string,
    ): CancelablePromise<GetPollResultsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns/{townID}/polls/{pollID}',
            path: {
                'townID': townId,
                'pollID': pollId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Deletes a poll in the town.
     * @param townId ID of the town
     * @param pollId ID of the poll to delete
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @returns void
     * @throws ApiError
     */
    public deletePoll(
        townId: string,
        pollId: string,
        xSessionToken: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/towns/{townID}/polls/{pollID}',
            path: {
                'townID': townId,
                'pollID': pollId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

}
