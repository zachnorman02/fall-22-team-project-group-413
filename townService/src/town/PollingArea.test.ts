import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import PollingArea from './PollingArea';

describe('PollingArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: PollingArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const isActive = true;
  const elapsedTimeSec = 10;
  const title = nanoid();
  const duration = 140;
  const votes = [];

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new PollingArea({ id, title, isActive, duration, elapsedTimeSec, votes }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, title, isActive, duration, elapsedTimeSec, votes });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    // TODO: what happens when last player leaves
    // it('Clears the video property when the last occupant leaves', () => {
    //   testArea.remove(newPlayer);
    //   const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
    //   expect(lastEmittedUpdate).toEqual({ id, isPlaying, elapsedTimeSec, video: undefined });
    //   expect(testArea.video).toBeUndefined();
    // });
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  test('toModel sets the ID, video, isPlaying and elapsedTimeSec', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id, 
      title, 
      isActive, 
      duration, 
      elapsedTimeSec, 
      votes
    });
  });
  test('updateModel sets video, isPlaying and elapsedTimeSec', () => {
    testArea.updateModel({ id: 'ignore', title: 'test2', isActive: false, duration: 200, elapsedTimeSec: 150, votes: []});
    expect(testArea.isActive).toBe(false);
    expect(testArea.id).toBe(id);
    expect(testArea.elapsedTimeSec).toBe(150);
    expect(testArea.title).toBe('test2');
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        PollingArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new viewing area using the provided boundingBox and id, with isPlaying defaulting to false and progress to 0, and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = PollingArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.isActive).toEqual(false);
      expect(val.elapsedTimeSec).toEqual(0);
      expect(val.title).toBeUndefined();
      expect(val.occupantsByID).toEqual([]);
    });
  });
});