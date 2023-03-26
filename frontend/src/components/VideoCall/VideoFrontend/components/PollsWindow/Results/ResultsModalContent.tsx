import { Accordion, AccordionItem, AccordionButton, AccordionPanel } from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import ResultsModalOption from './ResultsModalOption';
import { ResultsDisplay } from '../../../../../../types/CoveyTownSocket';

interface ResultsModalContentProps {
  anonymous: boolean;
  yourVote: number[];
  resultsDisplay: ResultsDisplay[];
}

const useStyles = makeStyles({
  optionListContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  optionOuterContainer: {
    marginBottom: '0.5rem',
  },
});

export default function ResultsModalContent({
  anonymous,
  yourVote,
  resultsDisplay,
}: ResultsModalContentProps) {
  const classes = useStyles();

  // the body of the results modal: using a vertical flexbox if anonymous,
  // or an accordian if not anonymous
  if (anonymous) {
    return (
      <div className={classes.optionListContainer}>
        {resultsDisplay.map((result, index) => (
          <div key={result.option} className={classes.optionOuterContainer}>
            <ResultsModalOption
              result={result}
              index={index}
              accordion={false}
              yourVote={yourVote}
            />
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
            <ResultsModalOption
              result={result}
              index={index}
              accordion={true}
              yourVote={yourVote}
            />
          </AccordionButton>
          <AccordionPanel style={{ padding: '0.5rem 1rem 0.5rem 1rem' }}>
            <div>{result.names}</div>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
