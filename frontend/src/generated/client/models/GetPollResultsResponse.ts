/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlayerPartial } from './PlayerPartial';
import type { PollSettings } from './PollSettings';

export type GetPollResultsResponse = {
    pollId: string;
    creator: PlayerPartial;
    userVotes: Array<number>;
    question: string;
    options: Array<string>;
    responses: (Array<Array<PlayerPartial>> | Array<number>);
    settings: PollSettings;
};

