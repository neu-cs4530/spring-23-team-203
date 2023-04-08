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
      'overflowY': 'auto',
    },
    pollCardsContrainer: {
      padding: '1em 1em 1em 1em',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    pollCardsHeader: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      overflowY: 'auto',
    },
    title: {
      fontWeight: 'bold',
      textAlign: 'left',
      fontSize: 20,
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

  const fetchPollsInfo = useCallback(async () => {
    setPolls(await coveyTownController.getAllPolls());
  }, [coveyTownController]);

  const deletePoll = async (pollId: string) => {
    await coveyTownController.deletePoll(pollId);
    setPolls(await coveyTownController.getAllPolls());
  };

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
        <div className={classes.pollCardsHeader}>
          <div className={classes.title}>Active Polls</div>
          <Button
            colorScheme='facebook'
            borderRadius='20'
            onClick={() => {
              setIsCreateModalOpen(true);
            }}>
            New +
          </Button>
        </div>
        <PollsList polls={polls} fetchPollsInfo={fetchPollsInfo} deletePoll={deletePoll} />
      </div>
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
