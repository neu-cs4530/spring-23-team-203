import Player from '../lib/Player';
import { TownEmitter, Poll as PollModel, PollSettings } from '../types/CoveyTownSocket';

export default class Poll {
  private _pollId: string;

  private _creatorId: string;

  private _question: string;

  private _options: string[];

  private _settings: PollSettings;

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
   * @param settings settings for the poll (e.g. anonymous, multiple choice)
   * @param votes list of [list of votedId] of length # of options
   * @param dateCreated date of poll creation
   */
  public constructor({
    pollId,
    creatorId,
    question,
    options,
    votes,
    dateCreated,
    settings,
  }: PollModel) {
    // this._coveyTownController = coveyTownController;
    this._pollId = pollId;
    this._creatorId = creatorId;
    this._question = question;
    this._options = options;
    this._settings = settings;
    // set dateCreated to current time
    this._dateCreated = dateCreated;
    // initialize no votes for each option
    this._votes = votes;
  }

  /**
   * Casts vote for the given option index, by the given voter
   * @param voterID player ID of voter
   * @param option option index to vote for
   */
  public vote(voterID: string, option: number) {
    // check option is in the poll
    if (option >= this._options.length || option < 0) {
      throw Error(`The given option index ${option} is not in the poll with 
      ID ${this._pollId} with ${this._options.length} options.`)
    }

    // check number of votes cast by voter isn't max

    // cast vote by adding voter to list of votes
    // TODO - change functionality for different poll settings
    this._votes[option].push(voterID);
  }

  /**
   * Get the list of all unique voters
   * @returns list of unique voter player IDs
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
   * Updates the state of this Poll, setting the votes properties
   *
   * @param updatedModel updated Poll model
   */
  public updateModel(updatedModel: Poll) {
    this._votes = updatedModel.votes;
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
      settings: this._settings,
      dateCreated: this._dateCreated,
    };
  }
}
