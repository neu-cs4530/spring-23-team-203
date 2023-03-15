import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import PollIcon from '../../../icons/PollIcon';
import useServiceContext from '../../../hooks/useServiceContext/useServiceContext';

const useStyles = makeStyles({
  iconContainer: {
    position: 'relative',
    display: 'flex',
  },
});

export default function TogglePollsButton() {
  const classes = useStyles();
  const { isPollsWindowOpen, setIsPollsWindowOpen } = useServiceContext();
  const { setIsBackgroundSelectionOpen } = useVideoContext();

  const togglePollsWindow = () => {
    setIsPollsWindowOpen(!isPollsWindowOpen);
    setIsBackgroundSelectionOpen(false);
  };

  return (
    <Button
      data-cy-chat-button
      onClick={togglePollsWindow}
      startIcon={
        <div className={classes.iconContainer}>
          <PollIcon />
        </div>
      }>
      Polls
    </Button>
  );
}
