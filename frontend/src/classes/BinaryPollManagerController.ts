import EventEmitter from 'events';
// import _ from 'lodash';
import { useEffect, useState } from 'react';
import { PollingArea as PollAreaModel, PollingOptionVotes } from '../types/CoveyTownSocket';
import TypedEmitter from 'typed-emitter';
import { LeafPoll, Result } from 'react-leaf-polls';
import TownController from './TownController';

/**
 * The events that the BinaryPollManagerController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type BinaryPollManagerEvents = {
  titleChange: (titleChange: string | undefined) => void;
  resultsChange: (newResults: PollingOptionVotes[]) => void;
  activeChange: (newActive: boolean) => void;
  timeChange: (newTime: number) => void;
  timeLimitChange: (newTimeLimit: number) => void;
};

export const NO_TOPIC_STRING = '(No topic)';
export const NO_RESULTS = [];
export const NO_SET_DURATION = 50;

export default class BinaryPollManagerController extends (EventEmitter as new () => TypedEmitter<BinaryPollManagerEvents>) {
  private _isActive: boolean;

  private _results?: PollingOptionVotes[];

  private _question?: string;

  private _time?: number;

  private _currTime: number;

  private _id: string;

  constructor(id: string, prompt?: string, results?: PollingOptionVotes[], timeLimit?: number) {
    super();
    this._isActive = true;
    this._results = results;
    this._question = prompt;
    this._time = timeLimit;
    this._currTime = 0;
    this._id = id;
  }

  get active() {
    return this._isActive;
  }

  set active(newActive: boolean) {
    this._isActive = newActive;
  }

  get id() {
    return this._id;
  }

  get results(): PollingOptionVotes[] | undefined {
    return this._results;
  }

  set results(newResults: PollingOptionVotes[] | undefined) {
    this._results = newResults;
  }

  get time(): number | undefined {
    return this._time;
  }

  set time(newTime: number | undefined) {
    this._time = newTime;
  }

  get question() {
    return this._question;
  }

  set question(newQuestion: string | undefined) {
    this._question = newQuestion;
  }

  get currentTime(): number {
    return this._currTime;
  }

  set currentTime(newCurrTime: number) {
    this._currTime = newCurrTime;
  }

  static fromBinaryPollManagerModel(model: PollAreaModel): BinaryPollManagerController {
    const ret = new BinaryPollManagerController(model.id, model.title, model.votes, model.duration);
    ret.currentTime = model.elapsedTimeSec;
    ret.active = model.isActive;
    return ret;
  }

  toBinaryPollManagerModel(): PollAreaModel {
    return {
      isActive: this.active,
      title: this.question,
      votes: this.results,
      elapsedTimeSec: this.currentTime,
      duration: this.time,
      id: this.id,
    };
  }

  public updateFrom(model: PollAreaModel): void {
    this.active = model.isActive;
    this.results = model.votes;
    this.currentTime = model.elapsedTimeSec;
    this.time = model.duration;
    this.question = model.title;
  }
}

// convert PollingOptionVotes into Result array for react-leaf-polls
export function optionVotesToResult(ctrlr: BinaryPollManagerController): Result[] {
  const resultArray: Result[] = [];
  if (ctrlr.results) {
    for (let i = 0; i < ctrlr.results.length; i++) {
      const res: Result = {
        id: ctrlr.results[i].id,
        text: ctrlr.results[i].option,
        votes: ctrlr.results[i].votes,
      };
      resultArray.push(res);
    }
  }
  return resultArray;
}

// updating votes
export function updateVotes(ctrlr: BinaryPollManagerController, res: Result): void {
  if (ctrlr.results) {
    for (let i = 0; i < ctrlr.results.length; i++) {
      if (ctrlr.results[i].id === res.id) {
        ctrlr.results[i].votes = res.votes;
      }
    }
  }
}

// set polls handler, pass to modals
// have isOpen logic here - listener, useEffect
// set local state boolean will determine whether to display

export function usePollManagerResults(poll: BinaryPollManagerController): PollingOptionVotes[] {
  const [results, setResults] = useState(poll.results);
  useEffect(() => {
    poll.addListener('resultsChange', setResults);
    return () => {
      poll.removeListener('resultsChange', setResults);
    };
  }, [poll]);
  return results || NO_RESULTS;
}

export function usePollManagerCurrentTime(poll: BinaryPollManagerController): number {
  const [time, setTime] = useState(poll.currentTime);
  useEffect(() => {
    poll.addListener('timeChange', setTime);
    return () => {
      poll.removeListener('timeChange', setTime);
    };
  }, [poll]);
  return time;
}

export function usePollManagerCurrentTimeLimit(poll: BinaryPollManagerController): number {
  const [timeLimit, setTimeLimit] = useState(poll.time);
  useEffect(() => {
    poll.addListener('timeLimitChange', setTimeLimit);
    return () => {
      poll.removeListener('timeLimitChange', setTimeLimit);
    };
  }, [poll]);
  return timeLimit || NO_SET_DURATION;
}

export function usePollManagerQuestion(poll: BinaryPollManagerController): string {
  const [question, setQuestion] = useState(poll.question);
  useEffect(() => {
    poll.addListener('titleChange', setQuestion);
    return () => {
      poll.removeListener('titleChange', setQuestion);
    };
  }, [poll]);
  return question || NO_TOPIC_STRING;
}
