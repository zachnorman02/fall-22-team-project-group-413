import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useBinaryPollManagerController, useInteractable } from '../../../classes/TownController';
import { PollingArea } from '../../../generated/client/models/PollingArea';
import useTownController from '../../../hooks/useTownController';
//import { isPollingArea } from '../../../types/TypeUtils';
//import { PollingOptionVotes } from '../../../types/CoveyTownSocket';
//import OngoingPollingModal from './OngoingPollingModal';

export default function NewPollingModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newPoll = useInteractable('pollingArea');
  const [title, setTitle] = useState<string | undefined>('');
  const [duration, setDuration] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (newPoll) {
      setOpen(true);
    }
  }, [newPoll]);

  // const isOpen = newPoll !== undefined;

  useEffect(() => {
    if (newPoll) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newPoll]);

  const closeModal = () => {
    setOpen(false);
  }; //coveyTownController
  // coveyTownController.interactEnd(newPoll);
  // close();

  const toast = useToast();
  const pollFillerId = newPoll ? newPoll.id : '';
  const pollController = useBinaryPollManagerController(pollFillerId);

  const createPoll = useCallback(async () => {
    if (title && duration && newPoll) {
      const pollToCreate: PollingArea = {
        id: newPoll.name,
        isActive: true,
        elapsedTimeSec: 0,
        duration: parseInt(duration),
        title: title,
        votes: [], //pollingoptionvotes
      };
      // console.log(createPoll);
      try {
        await coveyTownController.createPollingArea(pollToCreate);
        //console.log(pollController);
        pollController?.emit('activeChange', true);
        pollController?.updateFrom(pollToCreate);
        closeModal();
        // coveyTownController.emitNewPoll();
        toast({
          title: 'Poll Created!',
          status: 'success',
        });
        setTitle('');
        coveyTownController.unPause();
        // closeModal();
        // <OngoingPollingModal />;
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create poll',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [title, duration, newPoll, coveyTownController, pollController, toast]);

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a poll in {newPoll?.name} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createPoll();
            // display ongoing modal
            // <OngoingPollingModal />;
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='title'>Title of Poll</FormLabel>
              <Input
                id='title'
                placeholder='Share the title of your poll'
                name='title'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <Input
                pattern='[0-9]*'
                type='text'
                id='duration'
                placeholder='Enter a duration for your poll to accept votes'
                name='duration'
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createPoll}>
              Create
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
