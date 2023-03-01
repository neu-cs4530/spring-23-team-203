import Player from '../lib/Player';
import { TownEmitter, Poll as PollModel } from '../types/CoveyTownSocket';

export default class Poll {
  private _townEmitter: TownEmitter;

  private _id: string;

  private _creatorId: string;

  private _question: string;

  private _options: string[];

  private _votes: string[][]; // list of (list of votedId] corresponding to options

  private _dateCreated: Date;

  public get id() {
    return this._id;
  }

  public get creatorId() {
    return this._creatorId;
  }

  public get question() {
    return this._question;
  }

  public get options() {
    return this._options;
  }

  public get votes() {
    return this._votes;
  }

  public get dateCreated() {
    return this._dateCreated;
  }

  /**
   * Create a new Poll
   *
   * @param creatorId string creator of poll's id
   * @param question string poll question
   * @param options list of string answer options with length between 2-4
   */
  public constructor({ creatorId, question, options }: PollModel, townEmitter: TownEmitter) {
    // , coveyTownController: TownController) {
    // this._coveyTownController = coveyTownController;
    // TODO check if creatorId is in the IDs of one of the players in the town?
    this._creatorId = creatorId;
    this._question = question;
    // enforce number of options be 2, 3, or 4
    if (options.length < 2 || options.length > 4) {
      // TODO - remove error bc its handled in frontend or make a specific type of error
      throw Error('Number of options must be 2, 3, or 4');
    }
    this._options = options;
    // set  dateCreated to current time
    this._dateCreated = new Date();
    // initialize no votes for each option
    this._votes = new Array(this._options.length).fill([]);

    this._townEmitter = townEmitter;
  }

  /**
   * Convert this Poll instance to a simple PollModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): PollModel {
    return {
      id: this._id,
      creatorId: this._creatorId,
      question: this._question,
      options: this._options,
      votes: this._votes,
      dateCreated: this._dateCreated,
    };
  }
}
