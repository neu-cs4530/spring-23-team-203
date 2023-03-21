import Player from '../lib/Player';
import { TownEmitter, Poll as PollModel } from '../types/CoveyTownSocket';

export default class Poll {
  private _townEmitter: TownEmitter;

  private _pollId: string;

  private _creatorId: string;

  private _question: string;

  private _options: string[];

  private _votes: string[][];

  private _dateCreated: Date;

  public get pollId() {
    return this._pollId;
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
   * @param pollId string id of poll
   * @param creatorId string creator of poll's id
   * @param question string poll question
   * @param options list of string answer options with length between 2-4
   * @param votes list of [list of votedId] of length # of options
   * @param dateCreated date of poll creation
   */
  public constructor(
    { pollId, creatorId, question, options, votes, dateCreated }: PollModel,
    townEmitter: TownEmitter,
  ) {
    // , coveyTownController: TownController) {
    // this._coveyTownController = coveyTownController;
    this._pollId = pollId;
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
    this._dateCreated = dateCreated;
    // initialize no votes for each option
    this._votes = votes; // new Array(this._options.length).fill([]);

    this._townEmitter = townEmitter;
  }

  /**
   * Get the list of all unique voters
   *
   */
  public getVoters(): string[] {
    const voters = new Set<string>();
    this._votes.forEach(opt => {
      opt.forEach(o => {
        voters.add(o);
      });
    });
    return Array.from(voters.values());
  }

  /**
   * Get the index of the given option in the poll's options list
   * @param option string option to find
   */
  public getOptionIndex(option: string) {
    return this._options.indexOf(option);
  }

  /**
   * Cast a vote for the given option and voter.
   * @param voterID string userID of voter
   * @param option string option to be voted for
   */
  public vote(voterID: string, option: string) {
    const option_index = this.getOptionIndex(option);
    this._votes[option_index].push(voterID);
  }

  /**
   * Convert this Poll instance to a simple PollModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): PollModel {
    return {
      pollId: this._pollId,
      creatorId: this._creatorId,
      question: this._question,
      options: this._options,
      votes: this._votes,
      dateCreated: this._dateCreated,
    };
  }
}
