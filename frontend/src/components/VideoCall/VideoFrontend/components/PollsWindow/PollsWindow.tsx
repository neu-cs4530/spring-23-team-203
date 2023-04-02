import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import useServiceContext from '../../hooks/useServiceContext/useServiceContext';
import PollsWindowHeader from './PollsWindowHeader/PollsWindowHeader';
import PollsList from './PollsList/PollsList';
import { PollInfo } from '../../../../../generated/client/models/PollInfo';
import { Button } from '@chakra-ui/react';
import { CreatePollModal } from './CreatePoll/CreatePollModal';
import useTownController from '../../../../../hooks/useTownController';

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
      overflowY: 'auto',
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

// In this component, we are toggling the visibility of the PollsWindow with CSS instead of
// conditionally rendering the component in the DOM. This is done so that the PollsWindow is
// not unmounted while a file upload is in progress.
export default function PollsWindow() {
  const coveyTownController = useTownController();
  const classes = useStyles();
  const { isPollsWindowOpen } = useServiceContext();
  const [polls, setPolls] = useState<PollInfo[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  //const [error, setError] =

  const fetchPollsInfo = useCallback(async () => {
    try {
      setPolls(await coveyTownController.getAllPolls());
    } catch (e) {
      //setError(true);
    }
  }, [coveyTownController]);

  useEffect(() => {
    fetchPollsInfo();

    const interval = setInterval(() => {
      fetchPollsInfo();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [coveyTownController, fetchPollsInfo, isPollsWindowOpen]);

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
        <CreatePollModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          fetchPollsInfo={fetchPollsInfo}
        />
      )}
    </aside>
  );
}
