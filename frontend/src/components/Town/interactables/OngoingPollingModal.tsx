import {
  Button,
  //Container,
  FormControl,
  //FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  //useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react'; //useRef
//import ReactPlayer from 'react-player';
import { useInteractable, useBinaryPollManagerController } from '../../../classes/TownController';
// import ViewingAreaController from '../../../classes/ViewingAreaController';
import BinaryPollManagerController, {
  optionVotesToResult,
  updateVotes,
} from '../../../classes/BinaryPollManagerController';
import useTownController from '../../../hooks/useTownController';
//import SelectVideoModal from './SelectVideoModal';
//import ViewingAreaInteractable from './ViewingArea';
import PollingAreaInteractable from './PollingArea';
//import NewPollingModal from './NewPollingModal';
import { LeafPoll, Result } from 'react-leaf-polls';
import 'react-leaf-polls/dist/index.css';
//import { PollingOptionVotes } from '../../../types/CoveyTownSocket';
// import { PollingArea, PollingOptionVotes } from '../../../generated/client';
//import PollingArea from './PollingArea';

export function OngoingPollingModal({
  controller,
}: {
  controller: BinaryPollManagerController;
}): JSX.Element {
  const coveyTownController = useTownController();
  const newPoll = useInteractable('pollingArea');
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
    <Modal
      isOpen={controller.active} // controller.active
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{controller.question} </ModalHeader>
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
