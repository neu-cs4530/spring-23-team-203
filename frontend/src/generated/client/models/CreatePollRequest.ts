/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PollSettings } from './PollSettings';

export type CreatePollRequest = {
    question: string;
    options: Array<string>;
    settings: PollSettings;
};

