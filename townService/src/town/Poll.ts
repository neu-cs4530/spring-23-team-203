import { randomUUID } from 'crypto';
import { Poll as PollModel, PollSettings, PlayerPartial } from '../types/CoveyTownSocket';

export default class Poll {
  private _pollId: string;

  private _creator: PlayerPartial;

  private _question: string;

  private _options: string[];

  private _settings: PollSettings;

  private _votes: PlayerPartial[][];

  private _dateCreated: Date;

  public get pollId() {
    return this._pollId;
  }

  public get creatorId() {
    return this._creator;
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
  public constructor(
    creator: PlayerPartial,
    question: string,
    options: string[],
    settings: PollSettings,
  ) {
    this._pollId = randomUUID();
    this._creator = creator;
    this._question = question;
    this._options = options;
    this._settings = settings;
    // set dateCreated to current time
    this._dateCreated = new Date();
    // initialize no votes for each option
    this._votes = options.map(() => []);
  }

  /**
   * Casts votes for the given player
   * @param voter - Player who is casting the vote
   * @param userVotes - List of indices of the options the player is voting for
   */
  public vote(voter: PlayerPartial, userVotes: number[]) {
    if (userVotes.some(voteIndex => voteIndex < 0 || voteIndex >= this._options.length)) {
      throw new Error('vote index out of bounds');
    }
    if (!this._settings.multiSelect && userVotes.length > 1) {
      throw new Error('multiple votes not allowed in this poll');
    }
    this._votes.forEach(votes => {
      const index = votes.findIndex(vote => vote.id === voter.id);
      if (index !== -1) {
        throw new Error('player has already voted');
      }
    });

    userVotes.forEach(voteIndex => {
      this._votes[voteIndex].push(voter);
    });
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
  public getVoters(): PlayerPartial[] {
    const voters = new Set<PlayerPartial>();
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
   * Convert this Poll instance to a simple PollModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): PollModel {
    return {
      pollId: this._pollId,
      creator: this._creator,
      question: this._question,
      options: this._options,
      responses: this._settings.anonymize ? this._votes.map(v => v.length) : this._votes,
      settings: this._settings,
      dateCreated: this._dateCreated,
    };
  }
}
