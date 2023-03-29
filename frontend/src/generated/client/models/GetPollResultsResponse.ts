/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Poll } from './Poll';

export type GetPollResultsResponse = (Poll & {
    userVotes: Array<number>;
});

