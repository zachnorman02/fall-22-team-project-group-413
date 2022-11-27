import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  PollingOptionVotes,
  PollingArea as PollingAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class PollingArea extends InteractableArea {
  /* The title/question of the poll, or undefined if it is not set */
  private _title?: string;

  private _isActive: boolean;

  private _duration?: number;

  private _elapsedTimeSec: number;

  private _votes?: PollingOptionVotes[];

  public get title() {
    return this._title;
  }

  public get isActive() {
    return this._isActive;
  }

  public get duration() {
    return this._duration;
  }

  public get elapsedTimeSec() {
    return this._elapsedTimeSec;
  }

  public get votes() {
    return this._votes;
  }

  /**
   * Creates a new PollingArea
   *
   * @param pollingArea model containing this area's starting state
   * @param coordinates the bounding box that defines this polling area
   * @param townEmitter a broadcast emitter that can be used to emit updates
   * to players
   */
  public constructor(
    { id, title, isActive, duration, elapsedTimeSec, votes }: PollingAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._title = title;
    this._isActive = isActive;
    this._duration = duration;
    this._elapsedTimeSec = elapsedTimeSec;
    this._votes = votes;
  }

  /**
   * Removes a player from this polling area.
   *
   * Extends the base behavior of InteractableArea to set the title, votes, and duration of this PollingArea to undefined
   * to undefined and emit an update to other players in the town when the last player leaves.
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._title = undefined;
      this._duration = undefined;
      this._votes = undefined;
      this._emitAreaChanged();
    }
  }

  /**
   * Updates the state of this PollingArea, setting the title, isActive, duration, elapsed time, and votes properties.
   *
   * @param pollingArea updated model
   */
  public updateModel({ title, isActive, duration, elapsedTimeSec, votes }: PollingAreaModel) {
    this._title = title;
    this._isActive = isActive;
    this._duration = duration;
    this._elapsedTimeSec = elapsedTimeSec;
    this._votes = votes;
    console.log(title);
    console.log(isActive);
    console.log(duration);
    console.log(elapsedTimeSec);
    console.log(votes);
  }

  /**
   * Convert this PollingArea instance to a simple PollingAreaModel suitable for transporting over a socket to a client.
   */
  public toModel(): PollingAreaModel {
    return {
      id: this.id,
      title: this._title,
      isActive: this._isActive,
      duration: this._duration,
      elapsedTimeSec: this._elapsedTimeSec,
      votes: this._votes,
    };
  }

  /**
   * Creates a new PollingArea object that will represent a Polling Area object in the town map.
   *
   * @param mapObject An ITiledMapObject taht represents a rectange in which this polling area exists
   * @param townEmitter An emitter that can be used by this polling area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): PollingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new PollingArea({ isActive: false, id: name, elapsedTimeSec: 0 }, rect, townEmitter);
  }
}
