import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../../../../hooks/useTownController';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollID: string;
}

interface ResultsModalOutlineProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ResultsDisplay {
  option: string;
  percentage: string;
}

const useStyles = makeStyles({
  message: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  specialMessage: {
    fontSize: '1.5rem',
    fontWeight: 600,
    textAlign: 'center',
    margin: '3rem',
  },
  pollCreator: {
    marginBottom: '1rem',
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  optionText: {
    borderWidth: '2px',
    borderColor: 'black',
    borderRadius: '10px',
    paddingLeft: '1rem',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
  },
  totalVotes: {
    marginTop: '1rem',
  },
});

export function ResultsModalOutline({ children, isOpen, onClose }: ResultsModalOutlineProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>View Results</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function ResultsModal({ isOpen, onClose, pollID }: ResultsModalProps) {
  const coveyTownController = useTownController();
  const classes = useStyles();

  const [pollQuestion, setQuestion] = useState<string>('');
  const [pollCreator, setPollCreator] = useState<string>('');
  const [pollOptions, setOptions] = useState<string[]>([]);
  const [pollResponses, setResponses] = useState<number[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [resultsDisplay, setResultsDisplay] = useState<ResultsDisplay[]>([]);
  const [total, setTotal] = useState<number>();

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  // const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  // 90% width

  useEffect(() => {
    const getResults = async () => {
      try {
        const results = await coveyTownController.getPollResults(pollID);
        const { question, creatorName, options, responses } = results;

        if (
          !question ||
          !creatorName ||
          !options ||
          !responses ||
          !options.length ||
          !responses.length ||
          options.length !== responses.length
        ) {
          setError(true);
          return;
        }

        setQuestion(question);
        setPollCreator(creatorName);
        setOptions(options);
        setResponses(responses);
      } catch (e) {
        setError(true);
      }

      setLoading(false);
    };

    getResults();
  }, [coveyTownController, pollID]);

  useEffect(() => {
    const newResults = [];

    const newTotal = pollResponses.reduce((sofar: number, num: number) => sofar + num, 0);
    setTotal(newTotal);

    for (let i = 0; i < pollOptions.length; i++) {
      const percentage = Math.round((pollResponses[i] / newTotal) * 1000) / 10;
      newResults.push({ option: pollOptions[i], percentage: `${percentage}%` });
    }

    setResultsDisplay(newResults);
  }, [pollOptions, pollResponses]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  if (loading) {
    return (
      <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
        <p className={classes.specialMessage}>Loading poll results...</p>
      </ResultsModalOutline>
    );
  }

  if (error) {
    return (
      <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
        <p className={classes.specialMessage}>Sorry, there was an error fetching poll results.</p>
      </ResultsModalOutline>
    );
  }

  return (
    <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
      <div>
        <div className={classes.message}>{pollQuestion}</div>
        <div className={classes.pollCreator}>Asked by {pollCreator}</div>
        {resultsDisplay.map(result => (
          <div key={result.option} className={classes.optionContainer}>
            <div style={{ width: result.percentage }} className={classes.optionText}>
              {result.option}
            </div>
            <div>{result.percentage}</div>
          </div>
        ))}
        <div className={classes.totalVotes}>{`${total} votes`}</div>
      </div>
    </ResultsModalOutline>
  );
}
