/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PollOptions } from './PollOptions';

export type CreatePollRequest = {
    question: string;
    options: Array<string>;
    settings: PollOptions;
};

