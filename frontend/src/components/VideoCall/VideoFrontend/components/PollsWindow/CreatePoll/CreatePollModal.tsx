import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../../../../hooks/useTownController';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePollModal({ isOpen, onClose }: CreatePollModalProps) {
  const coveyTownController = useTownController();
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultiSelect, setAllowMultiSelect] = useState<boolean>(false);
  const [anonymizeResults, setAnonymizeResults] = useState<boolean>(false);

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  const createPoll = useCallback(async () => {
    if (question && options.every(option => option.length > 0)) {
      try {
        await coveyTownController.createPoll(
          question,
          options,
          {multiSelect: allowMultiSelect, anonymize: anonymizeResults},
        );
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create poster',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    } else {
      toast({
        title: 'Unable to create poll',
        description: 'All option and question titles must be filled out',
        status: 'error',
      });
    }
  }, [
    question,
    options,
    allowMultiSelect,
    anonymizeResults,
    coveyTownController,
    closeModal,
    toast,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a poll</ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createPoll();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}>
                <FormLabel htmlFor='title'>Question</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton as={Button} color='#fff'>
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='#0C1B29'
                      xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M20.9251 13.175C20.9751 12.8 21.0001 12.4125 21.0001 12C21.0001 11.6 20.9751 11.2 20.9126 10.825L23.4501 8.85C23.6751 8.675 23.7376 8.3375 23.6001 8.0875L21.2001 3.9375C21.0501 3.6625 20.7376 3.575 20.4626 3.6625L17.4751 4.8625C16.8501 4.3875 16.1876 3.9875 15.4501 3.6875L15.0001 0.5125C14.9501 0.2125 14.7001 0 14.4001 0H9.60014C9.30014 0 9.06264 0.2125 9.01264 0.5125L8.56264 3.6875C7.82514 3.9875 7.15014 4.4 6.53764 4.8625L3.55014 3.6625C3.27514 3.5625 2.96264 3.6625 2.81264 3.9375L0.425137 8.0875C0.275137 8.35 0.325137 8.675 0.575137 8.85L3.11264 10.825C3.05014 11.2 3.00014 11.6125 3.00014 12C3.00014 12.3875 3.02514 12.8 3.08764 13.175L0.550137 15.15C0.325137 15.325 0.262637 15.6625 0.400137 15.9125L2.80014 20.0625C2.95014 20.3375 3.26264 20.425 3.53764 20.3375L6.52514 19.1375C7.15014 19.6125 7.81264 20.0125 8.55014 20.3125L9.00014 23.4875C9.06264 23.7875 9.30014 24 9.60014 24H14.4001C14.7001 24 14.9501 23.7875 14.9876 23.4875L15.4376 20.3125C16.1751 20.0125 16.8501 19.6125 17.4626 19.1375L20.4501 20.3375C20.7251 20.4375 21.0376 20.3375 21.1876 20.0625L23.5876 15.9125C23.7376 15.6375 23.6751 15.325 23.4376 15.15L20.9251 13.175ZM12.0001 16.5C9.52514 16.5 7.50014 14.475 7.50014 12C7.50014 9.525 9.52514 7.5 12.0001 7.5C14.4751 7.5 16.5001 9.525 16.5001 12C16.5001 14.475 14.4751 16.5 12.0001 16.5Z'
                        fill='black'
                      />
                    </svg>
                  </MenuButton>
                  <MenuList maxWidth='140px'>
                    <MenuOptionGroup
                      title='Poll Settings'
                      type='checkbox'
                      onChange={value => {
                        setAllowMultiSelect(value.includes('multiselect'));
                        setAnonymizeResults(value.includes('anonymize'));
                      }}>
                      <MenuItemOption value='multiselect'>
                        Allow Voters to Select Multiple Options
                      </MenuItemOption>
                      <MenuItemOption value='anonymize'>Anonymize Results</MenuItemOption>
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              </div>
              <Input
                id='question'
                placeholder='What would you like to ask the town?'
                name='title'
                required={true}
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />
            </FormControl>
            <br />
            <FormControl>
              <FormLabel htmlFor='options'>Options</FormLabel>

              {options.map((option, index) => (
                <div
                  key={option}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <div
                    onClick={() => {
                      if (options.length > 2) {
                        const newOptions = [...options];
                        newOptions.splice(index, 1);
                        setOptions(newOptions);
                      }
                    }}>
                    <svg
                      width='25'
                      height='27'
                      viewBox='0 0 25 27'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M9.5835 11.5833V20.3333M15.4168 11.5833V20.3333M21.2502 5.75V23.25C21.2502 24.8608 19.9443 26.1667 18.3335 26.1667H6.66683C5.056 26.1667 3.75016 24.8608 3.75016 23.25V5.75M0.833496 5.75H24.1668M16.8752 5.75V4.29167C16.8752 2.68084 15.5693 1.375 13.9585 1.375H11.0418C9.431 1.375 8.12516 2.68084 8.12516 4.29167V5.75'
                        stroke={options.length == 2 ? '#a4a6aa' : '#0C1B29'}
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                  <Input
                    style={{ margin: '1rem', width: '90%' }}
                    id={`option-${index}`}
                    placeholder={`Option ${index + 1}`}
                    name={`option-${index}`}
                    required={true}
                    value={option}
                    onChange={e => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                  />
                </div>
              ))}
              <Button
                disabled={options.length >= 8}
                onClick={() => {
                  if (options.length < 8) {
                    setOptions([...options, '']);
                  }
                }}>
                Add Option
              </Button>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createPoll}>
              Submit
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
