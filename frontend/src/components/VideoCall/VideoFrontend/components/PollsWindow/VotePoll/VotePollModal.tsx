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
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import useTownController from '../../../../../../hooks/useTownController';
import VotePollModalBody from './VotePollModalBody';
import usePollInfo from '../../../hooks/usePollInfo/usePollInfo';

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
  const pollInfo = usePollInfo(pollID);

  const [question, setQuestion] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([]);

  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [multiSelect, setMultiSelect] = useState<boolean>(false);

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

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
        if (!pollInfo) {
          setError(true);
          setLoading(true);
          return;
        }

        const { pollQuestion, pollCreatorName, pollAnonymize, pollMultiSelect, pollOptions } =
          pollInfo;
        setQuestion(pollQuestion);
        setCreator(pollCreatorName);
        setAnonymous(pollAnonymize);
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
  }, [pollInfo]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  const selectedOptions: number[] = useMemo(() => {
    return options.reduce(
      (selectedSoFar: number[], currOption: Option) =>
        currOption.selected ? [...selectedSoFar, currOption.id] : selectedSoFar,
      [],
    );
  }, [options]);

  const votePoll = useCallback(async () => {
    try {
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
  }, [coveyTownController, pollID, selectedOptions, closeModal, fetchPollsInfo, question, toast]);

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
              anonymous={anonymous}
              multiSelect={multiSelect}
            />
          </ModalBody>
          <ModalFooter>
            {!loading && !error && (
              <Button
                as='button'
                colorScheme='blue'
                mr={3}
                onClick={votePoll}
                isDisabled={!selectedOptions.length}>
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
