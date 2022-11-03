import { PollingOptionVotes, BinaryPollManager as BinaryPollModel } from '../types/CoveyTownSocket';

export default class BinaryPollManager {
  /* The title/question of the poll, or undefined if it is not set */
  private _title?: string;

  private _isActive: boolean;

  private _duration: number;

  private _votes: PollingOptionVotes[];

  private _interactableID: string;

  public get title() {
    return this._title;
  }

  public get isActive() {
    return this._isActive;
  }

  public get duration() {
    return this._duration;
  }

  public get votes() {
    return this._votes;
  }

  public get interactableID() {
    return this._interactableID;
  }

  /**
   * Creates a new BinaryPollManager
   *
   * @param binaryPollManager model containing this area's starting state
   */
  public constructor({ title, isActive, duration, votes, interactableID }: BinaryPollModel) {
    this._title = title;
    this._isActive = isActive;
    this._duration = duration;
    this._votes = votes;
    this._interactableID = interactableID;
  }

  /**
   * Updates the state of this BinaryPollManager, setting the title, isActive, duration, votes, and interactableID properties
   *
   * @param binaryPollManager updated model
   */
  public updateModel({ title, isActive, duration, votes, interactableID }: BinaryPollModel) {
    this._title = title;
    this._isActive = isActive;
    this._duration = duration;
    this._votes = votes;
    this._interactableID = interactableID;
  }

  /**
   * Convert this BinaryPollManager instance to a simple BinaryPollModel suitable for transporting over a socket to a client
   */
  public toModel(): BinaryPollModel {
    return {
      title: this._title,
      isActive: this._isActive,
      duration: this._duration,
      votes: this._votes,
      interactableID: this._interactableID,
    };
  }
}
