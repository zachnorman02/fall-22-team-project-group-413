import EventEmitter from 'events';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';


/**
 * The events that the BinaryPollManagerController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
 export type BinaryPollManagerEvents = {
    titleChange: (titleChange: string | undefined) => void;
    resultsChange: (newResults: Map<string, number>) => void;
    activeChange: (newActive: boolean) => void;
  };

export default class BinaryPollManagerController extends (EventEmitter as new () => TypedEmitter<BinaryPollManagerEvents>) {

    private _isActive: boolean;

    private _results: Map<string, number>;

    private _question: string;

    private _time: number;

    private _currTime: number;

    constructor(results: Map<string, number>, prompt: string, timeLimit: number ) {
        super();
        this._isActive = true;
        this._results = results;
        this._question = prompt;
        this._time = timeLimit;
        this._currTime = 0;
    }

    get active() {
        return this._isActive;
    }
  
    set active(newActive: boolean) {
         this._isActive = newActive;
    }

    get results() {
        return this._results;
    }
  
    set results(newResults: Map<string, number>) {
        this._results = newResults;
    }

    get time() {
        return this._time;
    }
  
    set time(newTime: number) {
        this._time = newTime;
    }

    get question() {
        return this._question;
    }

    get currentTime() {
        return this._currTime;
    }
  
    set currentTime(newCurrTime: number) {
        this._currTime = newCurrTime;
    }


// static fromBinaryPollManagerModel(model: BinaryPollManagerModel): BinaryPollManagerController

// static toBinaryPollManagerModel(): BinaryPollManagerModel

// export function usePollManagerResults(poll: BinaryPollManagerController): Map<string,number>

// export function usePollManagerTimeLimit(poll: BinaryPollManagerController): number

// export function usePollManagerCurrentTime(poll: BinaryPollManagerController): number

// export function usePollManagerActive(poll: BinaryPollManagerController) : boolean



}
