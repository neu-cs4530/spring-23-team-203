import TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'events';
import { Poll as PollModel } from '../types/CoveyTownSocket';

export type PollEvents = {
  /**
   * A votesChange event indicates that the poll votes have changed.
   * Listeners are passed the new state.
   */
  votesChanged: (votes: string[] | undefined) => void;
};

export default class PollController extends (EventEmitter as new () => TypedEventEmitter<PollEvents>) {
  private _model: PollModel;

  private _playersWhoStarred: string[];

  /**
   * Constructs a new PollController, initialized with the state of the
   * provided pollModel.
   *
   * @param pollModel The poll model that this controller should represent
   */
  constructor(pollModel: PollModel) {
    super();
    this._model = pollModel;
  }
}
