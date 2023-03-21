interface CreatePollModalFormProps {
  onSubmit: () => void;
}
export function CreatePollModalForm() {
  return (
    <form>
      <input type='text' />
      <input type='submit' />
    </form>
  );
}
