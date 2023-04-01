import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState, Fragment } from 'react';
import useTownController from '../../../../../../hooks/useTownController';

interface VotePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollID: string;
}

const useStyles = makeStyles({
  specialMessage: {
    fontSize: '1.25rem',
    fontWeight: 600,
    textAlign: 'center',
    margin: '3rem',
  },
  question: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  pollCreator: {
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  },
});

export function VotePollModal({ isOpen, onClose, pollID }: VotePollModalProps) {
  const classes = useStyles();
  const coveyTownController = useTownController();

  const [question, setQuestion] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [options, setOptions] = useState<{ id: number; value: string }[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  console.log(selectedOptions);

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
          return;
        }

        const { name: pollCreatorName } = pollCreator;
        const { multiSelect: pollMultiSelect } = pollSettings;
        if (!pollCreatorName || !pollMultiSelect) {
          setError(true);
          return;
        }

        // set the question, creator name, options, and multiselect
        setQuestion(pollQuestion);
        setCreator(pollCreatorName);
        setMultiSelect(pollMultiSelect);

        const newOptions = pollOptions.map((option, index) => ({ id: index, value: option }));
        setOptions(newOptions);
      } catch (e) {
        setError(true);
      }

      setLoading(false);
    };
    getPollContent();
  }, [coveyTownController, pollID, isOpen, toast]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  const votePoll = useCallback(async () => {
    try {
      await coveyTownController.voteInPoll(pollID, selectedOptions);

      closeModal();
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
  }, [closeModal, coveyTownController, pollID, question, selectedOption, toast]);

  const voteOptionButtons = () => {
    const optionButtons: JSX.Element[] = [];
    options.forEach(option => {
      optionButtons.push(
        <Fragment key={option.id}>
          <Button
            id='{option}_btn'
            value={option.value}
            variant='outline'
            height='48px'
            width='90%'
            border='4px'
            style={{ borderRadius: '1rem' }}
            colorScheme='blue'
            onClick={() => setSelectedOptions(oldOptions => [...oldOptions, option.id])}>
            {option.value}
          </Button>
        </Fragment>,
      );
    });
    return (
      <Stack direction='column' spacing={4} align='center'>
        {optionButtons}
      </Stack>
    );
  };

  // loading message
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vote</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p className={classes.specialMessage}>Loading poll results...</p>;
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vote</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p className={classes.specialMessage}>
              Sorry, there was an error fetching poll results.
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vote</ModalHeader>
        <ModalCloseButton />
        <form>
          <ModalBody pb={6}>
            <div>
              <div className={classes.question}>{question}</div>
              <div className={classes.pollCreator}>Asked by {creator}</div>
            </div>
            {voteOptionButtons()}
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
