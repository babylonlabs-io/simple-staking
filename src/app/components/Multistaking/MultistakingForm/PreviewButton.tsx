import { Button } from "@babylonlabs-io/core-ui";
import { useFormState } from "@babylonlabs-io/core-ui";

export function PreviewButton() {
  const { isValid, errors } = useFormState();

  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys.map((key) => errors[key]?.message);

  return (
    <>
      {errorMessages.map((message, index) => (
        <div key={index} className="text-red-500 text-right">
          {message?.toString()}
        </div>
      ))}
      <Button
        //@ts-ignore - fix type issue in core-ui
        type="submit"
        className="w-full"
        style={{ marginTop: "8px" }}
        disabled={!isValid}
      >
        Preview
      </Button>
    </>
  );
}
