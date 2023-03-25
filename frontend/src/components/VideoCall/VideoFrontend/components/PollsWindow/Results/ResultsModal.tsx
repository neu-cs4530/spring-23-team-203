import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../../../../hooks/useTownController';
import { PlayerPartial } from '../../../../../../types/CoveyTownSocket';

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
  names: string;
}

interface GetResultsDisplayInputs {
  anonymize: boolean;
  options: string[];
  responses: number[] | PlayerPartial[][];
}

interface GetResultsDisplayOutputs {
  results: ResultsDisplay[];
  total: number;
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
  optionListContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  optionOuterContainer: {
    marginBottom: '0.5rem',
  },
  optionContainer: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    alignItems: 'stretch',
  },
  bar: {
    borderRadius: '0.5rem',
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
    justifySelf: 'start',
  },
  optionText: {
    gridRow: '1 / 1',
    gridColumn: '1 /  1',
    justifySelf: 'start',
    marginTop: '0.25rem',
    marginBottom: '0.25rem',
    marginLeft: '1rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'black',
  },
  rightSide: {
    display: 'flex',
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
    justifySelf: 'end',
    justifyContent: 'flex-end',
    marginRight: '1rem',
  },
  percentage: {
    marginTop: '0.25rem',
    marginBottom: '0.25rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'black',
  },
  accordionIcon: {
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  totalVotes: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
    fontSize: '1rem',
    fontWeight: 600,
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

  const [question, setQuestion] = useState<string>('');
  const [creator, setCreator] = useState<string>('');

  const [resultsDisplay, setResultsDisplay] = useState<ResultsDisplay[]>([]);
  const [yourVote, setYourVote] = useState<number[]>([]);
  const [anonymous, setAnonymous] = useState<boolean>(true);

  const [total, setTotal] = useState<number>();

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const getResultsDisplay = useCallback(
    ({ anonymize, options, responses }: GetResultsDisplayInputs): GetResultsDisplayOutputs => {
      let names: string[][] = [];
      let votes: number[] = [];

      // get the number of votes, and the names of those who voted for each option
      if (anonymize) {
        names = (responses as number[]).map(() => []);
        votes = responses as number[];
      } else {
        names = (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) =>
          ppl.map((pp: PlayerPartial) => pp.name),
        );
        votes = (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) => ppl.length);
      }

      // calculate the total number of votes
      const newTotal = votes.reduce((sofar: number, num: number) => sofar + num, 0);

      // for each option, create an object with the option text, the percentage, and the names
      const newResults = [];
      for (let i = 0; i < options.length; i++) {
        const percentage = Math.round((votes[i] / newTotal) * 1000) / 10;
        const formattedNames = names[i]
          .reduce((sofar, curr) => `${sofar}, ${curr}`, '')
          .substring(2);

        newResults.push({
          option: options[i],
          percentage: `${percentage}%`,
          names: formattedNames,
        });
      }

      return { results: newResults, total: newTotal };
    },
    [],
  );

  // get results from the API and store them in React state
  useEffect(() => {
    const getResults = async () => {
      try {
        const results = await coveyTownController.getPollResults(pollID);
        const {
          creatorName: pollCreatorName,
          yourVote: pollYourVote,
          question: pollQuestion,
          options: pollOptions,
          responses: pollResponses,
          settings: pollSettings,
        } = results;

        if (!pollSettings) {
          setError(true);
          return;
        }

        const { anonymize } = pollSettings;

        if (
          anonymize === undefined ||
          !pollCreatorName ||
          !pollYourVote ||
          !pollQuestion ||
          !pollOptions ||
          !pollResponses ||
          !pollOptions.length ||
          !pollResponses.length ||
          !pollYourVote.length ||
          pollOptions.length !== pollResponses.length
        ) {
          setError(true);
          return;
        }

        // set the question, creator name, and what you voted for
        setQuestion(pollQuestion);
        setCreator(pollCreatorName);
        setYourVote(pollYourVote);
        setAnonymous(anonymize);

        // format the display of results, including the total number of votes
        const { total: newTotal, results: newResults } = getResultsDisplay({
          anonymize: anonymize,
          options: pollOptions,
          responses: pollResponses,
        });
        setTotal(newTotal);
        setResultsDisplay(newResults);
      } catch (e) {
        setError(true);
      }

      setLoading(false);
    };

    getResults();
  }, [coveyTownController, pollID, getResultsDisplay]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  // loading message
  if (loading) {
    return (
      <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
        <p className={classes.specialMessage}>Loading poll results...</p>
      </ResultsModalOutline>
    );
  }

  // error message
  if (error) {
    return (
      <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
        <p className={classes.specialMessage}>Sorry, there was an error fetching poll results.</p>
      </ResultsModalOutline>
    );
  }

  // all content for a single option
  const singleOption = (result: ResultsDisplay, index: number, accordion: boolean) => {
    return (
      <div className={classes.optionContainer}>
        <div
          style={{
            width: result.percentage,
            backgroundColor: yourVote.some((vote: number) => vote === index)
              ? 'rgba(96, 128, 170, 0.80)'
              : 'rgba(96, 128, 170, 0.20)',
          }}
          className={classes.bar}></div>
        <div className={classes.optionText}>{result.option}</div>
        <div className={classes.rightSide}>
          <div className={classes.percentage}>{result.percentage}</div>
          {accordion && (
            <div className={classes.accordionIcon}>
              <AccordionIcon />
            </div>
          )}
        </div>
      </div>
    );
  };

  // the body of the results modal: using a vertical flexbox if anonymous,
  // or an accordian if not anonymous
  const resultsModalBody = () => {
    if (anonymous) {
      return (
        <div className={classes.optionListContainer}>
          {resultsDisplay.map((result, index) => (
            <div key={result.option} className={classes.optionOuterContainer}>
              {singleOption(result, index, false)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <Accordion allowMultiple>
        {resultsDisplay.map((result, index) => (
          <AccordionItem key={result.option} style={{ borderWidth: 0, paddingBottom: '0.5rem' }}>
            <AccordionButton style={{ padding: 0 }}>
              {singleOption(result, index, true)}
            </AccordionButton>
            <AccordionPanel style={{ padding: '0.5rem 1rem 0.5rem 1rem' }}>
              <div>{result.names}</div>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
      <div>
        <div className={classes.question}>{question}</div>
        <div className={classes.pollCreator}>Asked by {creator}</div>
        {resultsModalBody()}
        <div className={classes.totalVotes}>{`${total} votes`}</div>
      </div>
    </ResultsModalOutline>
  );
}
