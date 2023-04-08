import { AccordionIcon } from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { ResultsDisplay } from '../../../../../../types/CoveyTownSocket';
import TextWithHyperlink from '../TextWithHyperlink';

interface ResultsModalOptionProps {
  result: ResultsDisplay;
  index: number;
  accordion: boolean;
  yourVote: number[];
  anonymous: boolean;
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
  leftSide: {
    display: 'flex',
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
    justifySelf: 'start',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '0.25rem',
    marginBottom: '0.25rem',
    marginLeft: '1rem',
  },
  optionText: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'black',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
  checkmark: {
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  rightSide: {
    display: 'flex',
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
    justifySelf: 'end',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  anonymous,
}: ResultsModalOptionProps) {
  const classes = useStyles();
  const youVotedFor = yourVote.some((vote: number) => vote === index);

  return (
    <div className={classes.optionContainer}>
      <div
        style={{
          width: result.percentage,
          backgroundColor: youVotedFor ? 'rgba(49, 130, 206, 0.75)' : 'rgba(49, 130, 206, 0.20)',
        }}
        className={classes.bar}></div>
      <div className={classes.leftSide} style={{ marginRight: anonymous ? '4.5rem' : '6.25rem' }}>
        <div className={classes.optionText}>
          <TextWithHyperlink className={classes.optionText} text={result.option} selected={false}/>
        </div>
        {youVotedFor && (
          <div className={classes.checkmark}>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='18' height='18'>
              {/* Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - 
          https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */}
              <path
                d='M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 
          0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 
          111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z'
              />
            </svg>
          </div>
        )}
      </div>
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
