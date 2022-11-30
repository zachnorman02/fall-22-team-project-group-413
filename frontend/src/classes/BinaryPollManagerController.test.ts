import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PollingOptionVotes } from '../types/CoveyTownSocket';
import BinaryPollManagerController, {
  BinaryPollManagerEvents,
  findPollOption,
  optionVotesToResult,
} from './BinaryPollManagerController';
import { PollingArea as PollAreaModel } from '../types/CoveyTownSocket';
import { Result } from 'react-leaf-polls';

describe('BinaryPollManagerController', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: BinaryPollManagerController;
  const mockListeners = mock<BinaryPollManagerEvents>();
  beforeEach(() => {
    testArea = new BinaryPollManagerController(nanoid(), nanoid());
    mockClear(mockListeners.titleChange);
    mockClear(mockListeners.timeChange);
    mockClear(mockListeners.activeChange);
    mockClear(mockListeners.timeLimitChange);
    mockClear(mockListeners.resultsChange);
    testArea.addListener('titleChange', mockListeners.titleChange);
    testArea.addListener('timeChange', mockListeners.timeChange);
    testArea.addListener('activeChange', mockListeners.activeChange);
    testArea.addListener('timeLimitChange', mockListeners.timeLimitChange);
    testArea.addListener('resultsChange', mockListeners.resultsChange);
  });
  describe('question', () => {
    it('Returns the set title and emit title change', () => {
      testArea.question = 'poll title';
      expect(testArea.question).toBe('poll title');
      expect(mockListeners.titleChange).toBeCalled();
    });
    it('Returns true if the title is undefined', () => {
      testArea.question = undefined;
      expect(testArea.question).toBe(undefined);
    });
  });

  describe('active', () => {
    it('Returns the set active and emit active change', () => {
      testArea.active = true;
      expect(testArea.active).toBe(true);
      expect(mockListeners.activeChange).toBeCalled();
    });
    it('Returns true if active is false', () => {
      testArea.active = false;
      expect(testArea.active).toBe(false);
      expect(mockListeners.activeChange).toBeCalled();
    });
  });

  describe('duration', () => {
    it('Returns the set time limit and emit time limit change', () => {
      testArea.time = 15;
      expect(testArea.time).toBe(15);
      expect(mockListeners.timeLimitChange).toBeCalled();
    });
    it('Returns true if time limit is undefined', () => {
      testArea.time = undefined;
      expect(testArea.time).toBe(undefined);
      expect(mockListeners.timeLimitChange).toBeCalled();
    });
  });

  describe('current time', () => {
    it('Returns the set current time and emit time change', () => {
      testArea.currentTime = 22;
      expect(testArea.currentTime).toBe(22);
      expect(mockListeners.timeChange).toBeCalled();
    });
  });

  describe('results', () => {
    it('Returns the set results and emit results change', () => {
      const option1: PollingOptionVotes = {
        id: 0,
        option: 'yes',
        votes: 2,
      };
      const option2: PollingOptionVotes = {
        id: 1,
        option: 'no',
        votes: 2,
      };
      const res: PollingOptionVotes[] = [option1, option2];
      testArea.results = res;
      expect(testArea.results).toBe(res);
      expect(mockListeners.resultsChange).toBeCalled();
    });
    it('Returns true if the results is undefined', () => {
      testArea.results = undefined;
      expect(testArea.results).toBe(undefined);
    });
  });

  describe('to model', () => {
    it('Returns the model of the controller', () => {
      testArea.time = 29;
      testArea.currentTime = 12;
      testArea.active = true;
      testArea.question = 'poll title';
      const option1: PollingOptionVotes = {
        id: 0,
        option: 'yes',
        votes: 2,
      };
      const option2: PollingOptionVotes = {
        id: 1,
        option: 'no',
        votes: 1,
      };
      const res: PollingOptionVotes[] = [option1, option2];
      testArea.results = res;
      expect(testArea.results).toBe(res);
      expect(mockListeners.resultsChange).toBeCalled();
      const returnModel = testArea.toBinaryPollManagerModel();
      expect(returnModel.title).toBe('poll title');
      expect(returnModel.duration).toBe(29);
      expect(returnModel.elapsedTimeSec).toBe(12);
      expect(returnModel.votes).toBe(res);
    });
  });

  describe('from model', () => {
    it('Returns the controller based off of model', () => {
      testArea.time = 29;
      testArea.currentTime = 12;
      testArea.active = true;
      testArea.question = 'poll title';
      const option1: PollingOptionVotes = {
        id: 0,
        option: 'yes',
        votes: 2,
      };
      const option2: PollingOptionVotes = {
        id: 1,
        option: 'no',
        votes: 4,
      };
      const res: PollingOptionVotes[] = [option1, option2];
      testArea.results = res;
      expect(testArea.results).toBe(res);
      expect(mockListeners.resultsChange).toBeCalled();
      const returnModel = testArea.toBinaryPollManagerModel();
      const returnController = BinaryPollManagerController.fromBinaryPollManagerModel(returnModel);
      expect(returnController.active).toBe(testArea.active);
      expect(returnController.results).toBe(testArea.results);
      expect(returnController.question).toBe(testArea.question);
      expect(returnController.currentTime).toBe(testArea.currentTime);
      expect(returnController.time).toBe(testArea.time);
    });
  });

  describe('update from', () => {
    it('Returns the conrtoller with updated fields', () => {
      testArea.time = 29;
      testArea.currentTime = 12;
      testArea.active = true;
      testArea.question = 'poll title';
      const option1: PollingOptionVotes = {
        id: 0,
        option: 'yes',
        votes: 2,
      };
      const option2: PollingOptionVotes = {
        id: 1,
        option: 'no',
        votes: 3,
      };
      const res: PollingOptionVotes[] = [option1, option2];
      testArea.results = res;

      const newOption1: PollingOptionVotes = {
        id: 0,
        option: 'yes',
        votes: 7,
      };
      const newOption2: PollingOptionVotes = {
        id: 1,
        option: 'no',
        votes: 4,
      };
      const newVotes: PollingOptionVotes[] = [newOption1, newOption2];
      testArea.results = res;

      const newModel: PollAreaModel = {
        isActive: true,
        votes: newVotes,
        title: testArea.question,
        duration: testArea.time,
        elapsedTimeSec: 19,
        id: testArea.id,
      };
      testArea.updateFrom(newModel);
      expect(testArea.question).toBe('poll title');
      expect(testArea.time).toBe(29);
      expect(testArea.currentTime).toBe(19);
      expect(testArea.results).toBe(newVotes);
    });
  });

  describe('find polling option', () => {
    it('Returns the number of votes from the yes option', () => {
      const option1: PollingOptionVotes = {
        id: 0,
        option: 'yes',
        votes: 2,
      };
      const option2: PollingOptionVotes = {
        id: 1,
        option: 'no',
        votes: 5,
      };
      const res: PollingOptionVotes[] = [option1, option2];
      testArea.results = res;
      const numVotes = findPollOption('yes', testArea);
      expect(numVotes).toBe(2);
    });
    it('Returns 0 if the results is undefined', () => {
      testArea.results = undefined;
      const numVotes = findPollOption('yes', testArea);
      expect(numVotes).toBe(0);
    });
  });

  describe('option votes to result', () => {
    it('Returns the number of votes from the yes option', () => {
      const option1: PollingOptionVotes = {
        id: 0,
        option: 'yes',
        votes: 2,
      };
      const option2: PollingOptionVotes = {
        id: 1,
        option: 'no',
        votes: 5,
      };
      const res: PollingOptionVotes[] = [option1, option2];
      testArea.results = res;
      const returnValue: Result[] = optionVotesToResult(testArea);
      expect(returnValue[0].votes).toBe(0);
      expect(returnValue[1].votes).toBe(0);
    });
  });
});
