/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlayerPartial } from './PlayerPartial';
import type { PollSettings } from './PollSettings';

export type Poll = {
    responses: (Array<Array<PlayerPartial>> | Array<number>);
    settings: PollSettings;
    options: Array<string>;
    question: string;
    creator: PlayerPartial;
    pollId: string;
};

