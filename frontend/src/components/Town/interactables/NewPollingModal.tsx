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
import { useInteractable } from '../../../classes/TownController';
import { PollingArea } from '../../../generated/client/models/PollingArea';
import useTownController from '../../../hooks/useTownController';

export default function NewPollingModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newPoll = useInteractable('pollingArea');
  const [title, setTitle] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);

  const isOpen = newPoll !== undefined;

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

  const toast = useToast();

  const createPoll = useCallback(async () => {
    if (title && newPoll) {
      const pollToCreate: PollingArea = {
        id: newPoll.name,
        isActive: true,
        elapsedTimeSec: 0,
      };
      try {
        await coveyTownController.createPollingArea(pollToCreate);
        toast({
          title: 'Poll Created!',
          status: 'success',
        });
        setTitle('');
        coveyTownController.unPause();
        closeModal();
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
  }, [title, setTitle, coveyTownController, newPoll, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
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
                id='duration'
                placeholder='Enter a duration for your poll to accept votes'
                name='duration'
                value={duration}
                onChange={e => setDuration(e.target.valueAsNumber)}
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
