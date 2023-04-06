import {
  Button,
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
import useTownController from '../../../../../../hooks/useTownController';
import VotePollModalBody from './VotePollModalBody';

interface VotePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollID: string;
  fetchPollsInfo: () => void;
}

interface Option {
  id: number;
  text: string;
  selected: boolean;
}

export function VotePollModal({ isOpen, onClose, pollID, fetchPollsInfo }: VotePollModalProps) {
  const coveyTownController = useTownController();

  const [question, setQuestion] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  console.log(loading);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  // get results from the API and store them in React state
  useEffect(() => {
    const getPollContent = async () => {
      try {
        const poll = await coveyTownController.getPollResults(pollID);
        if (!poll) {
          setError(true);
          setLoading(false);
          return;
        }

        const {
          question: pollQuestion,
          creator: pollCreator,
          options: pollOptions,
          settings: pollSettings,
        } = poll;
        if (!pollCreator || !pollQuestion || !pollOptions || !pollSettings) {
          setError(true);
          setLoading(false);
          return;
        }

        const { name: pollCreatorName } = pollCreator;
        const { multiSelect: pollMultiSelect } = pollSettings;
        if (!pollCreatorName || pollMultiSelect === undefined) {
          setError(true);
          setLoading(false);
          return;
        }

        // set the question, creator name, options, and multiselect
        setQuestion(pollQuestion);
        setCreator(pollCreatorName);
        setMultiSelect(pollMultiSelect);

        const newOptions = pollOptions.map((option, index) => ({
          id: index,
          text: option,
          selected: false,
        }));
        setOptions(newOptions);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };
    getPollContent();
  }, [coveyTownController, pollID, isOpen, toast]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  const votePoll = useCallback(async () => {
    try {
      const selectedOptions: number[] = options.reduce(
        (selectedSoFar: number[], currOption: Option) =>
          currOption.selected ? [...selectedSoFar, currOption.id] : selectedSoFar,
        [],
      );

      await coveyTownController.voteInPoll(pollID, selectedOptions);

      closeModal();
      fetchPollsInfo();
      toast({
        title: 'Successful vote',
        description: `Congratulations! You voted in poll "${question}"`,
        status: 'success',
      });
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: 'Unable to vote in poll',
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
  }, [closeModal, coveyTownController, pollID, question, toast, options]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vote</ModalHeader>
        <ModalCloseButton />
        <form>
          <ModalBody pb={6}>
            <VotePollModalBody
              loading={loading}
              error={error}
              question={question}
              creator={creator}
              options={options}
              setOptions={setOptions}
              multiSelect={multiSelect}
            />
          </ModalBody>
          <ModalFooter>
            {!loading && !error && (
              <Button colorScheme='blue' mr={3} onClick={votePoll}>
                Submit
              </Button>
            )}
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
