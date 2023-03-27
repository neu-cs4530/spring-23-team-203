import { AccordionIcon } from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { ResultsDisplay } from '../../../../../../types/CoveyTownSocket';

interface ResultsModalOptionProps {
  result: ResultsDisplay;
  index: number;
  accordion: boolean;
  yourVote: number[];
}

const useStyles = makeStyles({
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
});

export default function ResultsModalOption({
  result,
  index,
  accordion,
  yourVote,
}: ResultsModalOptionProps) {
  const classes = useStyles();
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
}
