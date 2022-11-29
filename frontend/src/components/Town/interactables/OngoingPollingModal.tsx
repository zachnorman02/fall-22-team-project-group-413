import {
  Button,
  Container,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react'; //useRef
import { useInteractable, useBinaryPollManagerController } from '../../../classes/TownController';
import BinaryPollManagerController, {
  optionVotesToResult,
  updateVotes,
  usePollManagerQuestion,
} from '../../../classes/BinaryPollManagerController';
import useTownController from '../../../hooks/useTownController';
import PollingAreaInteractable from './PollingArea';
import { LeafPoll, Result } from 'react-leaf-polls';
import 'react-leaf-polls/dist/index.css';

// how to store data - backend synch w frontend
// emit data to other users (title etc)
// emit flow - assignment 2 diagram
// backend has to tell each user to open the modal based on frontend input, frontend listens, then logic for changes is emitted

export function OngoingPollingModal({
  controller,
}: {
  controller: BinaryPollManagerController;
}): JSX.Element {
  const coveyTownController = useTownController();
  const newPoll = useInteractable('pollingArea');
  const controlQuestion = usePollManagerQuestion(controller);
  // const [title, setTitle] = useState<string | undefined>('');
  // const [duration, setDuration] = useState('');

  // const isOpen = newPoll !== undefined;

  useEffect(() => {
    if (newPoll) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newPoll]);

  const closeModal = useCallback(() => {
    if (newPoll) {
      coveyTownController.interactEnd(newPoll);
    }
  }, [coveyTownController, newPoll]);

  // vote function - send back to controller
  // Here you probably want to manage
  // and return the modified data to the server.
  //, results: Result[]
  function vote(item: Result) {
    updateVotes(controller, item);
    closeModal();
  }

  return (
    <Container className='participant-wrapper'>
      <Modal
        isOpen={controller.active} // controller.active
        onClose={() => {
          closeModal();
          coveyTownController.unPause();
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{controlQuestion} </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={ev => {
              ev.preventDefault();
            }}>
            <ModalBody pb={6}>
              <FormControl>
                <LeafPoll type='binary' results={optionVotesToResult(controller)} onVote={vote} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button onClick={closeModal}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
}

/**
 * The PollingArea monitors the player's interaction with a PollingArea on the map: displaying either
 * a popup to set the poll for a polling area, or if the poll is set, the ongoing poll.
 *
 * @param props: the polling area interactable that is being interacted with
 */
export function PollingArea({
  pollingArea,
  pollController,
}: {
  pollingArea: PollingAreaInteractable;
  pollController: BinaryPollManagerController;
}): JSX.Element {
  const townController = useTownController();
  // const binaryPollManagerController = useBinaryPollManagerController(pollingArea.id);
  const [selectIsOpen, setSelectIsOpen] = useState<boolean>(pollingArea.active === undefined);
  useEffect(() => {
    const setActive = (active: boolean) => {
      if (!active) {
        townController.interactableEmitter.emit('endIteraction', pollController);
      } else {
        setSelectIsOpen(active);
      }
    };
    pollController.addListener('activeChange', setActive);
    return () => {
      pollController.removeListener('activeChange', setActive);
    };
  }, [pollController, townController]);

  /*useEffect(() => {
    const setPollHandler = (poll: PollingArea) => {
      console.log(poll);
    };
    pollController.addListener('pollChange', setPollHandler);
    return () => {
      pollController.removeListener('activeChange', setActive);
    };
  }, [pollController, townController]);*/

  console.log(selectIsOpen);

  /*if (!selectIsOpen) {
    return <NewPollingModal />;
  }*/

  if (selectIsOpen) {
    return (
      <>
        <OngoingPollingModal controller={pollController} />
      </>
    );
  }

  return <> </>;
}

/**
 * The PollingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function PollingAreaWrapper(): JSX.Element {
  const pollingArea = useInteractable<PollingAreaInteractable>('pollingArea'); // diff hook
  const pollFillerId = pollingArea ? pollingArea.id : '';
  const binaryPollManagerController = useBinaryPollManagerController(pollFillerId);
  if (pollingArea && binaryPollManagerController) {
    return <PollingArea pollingArea={pollingArea} pollController={binaryPollManagerController} />;
  }
  return <></>;
}
