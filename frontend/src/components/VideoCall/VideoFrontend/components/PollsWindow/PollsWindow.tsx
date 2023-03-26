import React, { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import useServiceContext from '../../hooks/useServiceContext/useServiceContext';
import PollsWindowHeader from './PollsWindowHeader/PollsWindowHeader';
import { Button } from '@chakra-ui/react';
import { CreatePollModal } from './CreatePoll/CreatePollModal';
import ResultsModal from './Results/ResultsModal';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pollsWindowContainer: {
      'pointerEvents': 'auto',
      'background': '#FFFFFF',
      'zIndex': 1000,
      'display': 'flex',
      'flexDirection': 'column',
      'borderLeft': '1px solid #E4E7E9',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
      },
      'position': 'fixed',
      'bottom': 0,
      'left': 0,
      'top': 0,
      'right': 350,
      'max-width': '350px',
    },
    hide: {
      display: 'none',
    },
  }),
);

// In this component, we are toggling the visibility of the PollsWindow with CSS instead of
// conditionally rendering the component in the DOM. This is done so that the PollsWindow is
// not unmounted while a file upload is in progress.

export default function PollsWindow() {
  const classes = useStyles();
  const { isPollsWindowOpen } = useServiceContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const pollID = 'test';

  return (
    <aside className={clsx(classes.pollsWindowContainer, { [classes.hide]: !isPollsWindowOpen })}>
      <PollsWindowHeader />
      <Button
        onClick={() => {
          setIsCreateModalOpen(true);
        }}>
        Create Poll
      </Button>
      <Button
        onClick={() => {
          setIsResultsModalOpen(true);
        }}>
        View Results
      </Button>
      {isCreateModalOpen && (
        <CreatePollModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      )}
      {isResultsModalOpen && (
        <ResultsModal
          isOpen={isResultsModalOpen}
          onClose={() => setIsResultsModalOpen(false)}
          pollID={pollID}
        />
      )}
    </aside>
  );
}
