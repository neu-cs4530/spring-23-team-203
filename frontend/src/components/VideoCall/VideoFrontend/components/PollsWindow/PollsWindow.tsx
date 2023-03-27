import React, { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import useServiceContext from '../../hooks/useServiceContext/useServiceContext';
import PollsWindowHeader from './PollsWindowHeader/PollsWindowHeader';
import PollsList from './PollsList/PollsList';
import { Poll } from '../../../../../types/CoveyTownSocket';
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
    pollCardsContrainer: {
      padding: '1em 1em 1em 1em',
    },
    title: {
      fontWeight: 'bold',
      textAlign: 'left',
      fontSize: 20,
      padding: '0 0 1em 0.5em',
    },
    hide: {
      display: 'none',
    },
  }),
);

const poll = {
  pollId: '1',
  creatorId: '00000',
  dateCreated: new Date(500000000000),
  question: 'Do you like beans?',
  options: ['Yes', 'No'],
  votes: [['00000', '01111'], ['00001']],
  settings: { anonymize: false, multiSelect: false },
};

const poll2 = {
  pollId: '2',
  creatorId: '00001',
  dateCreated: new Date(500000000000),
  question: 'Do you like bees?',
  options: ['Yes', 'No'],
  votes: [
    ['00000', '01111', '12345', '11111', '33333', '21324'],
    ['00001', '54321', '22222'],
  ],
  settings: { anonymize: false, multiSelect: false },
};

// In this component, we are toggling the visibility of the PollsWindow with CSS instead of
// conditionally rendering the component in the DOM. This is done so that the PollsWindow is
// not unmounted while a file upload is in progress.
export default function PollsWindow() {
  const classes = useStyles();
  const { isPollsWindowOpen } = useServiceContext();
  const polls: Poll[] = [poll, poll2];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <aside className={clsx(classes.pollsWindowContainer, { [classes.hide]: !isPollsWindowOpen })}>
      <PollsWindowHeader />
      <div className={classes.pollCardsContrainer}>
        <div className={classes.title}>Active Polls</div>
        <PollsList polls={polls} />
      </div>
      <Button
        onClick={() => {
          setIsCreateModalOpen(true);
        }}>
        Create Poll
      </Button>
      {isCreateModalOpen && (
        <CreatePollModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      )}
    </aside>
  );
}
