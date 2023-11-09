import { Modal, type ModalRef } from "components/Modal";
import CustomTab from "components/Tab";
import { forwardRef, type ForwardedRef } from "react";
import { useForm, FormProvider } from "react-hook-form";

interface SaveAsPieceModalRef extends ModalRef {}
interface SaveAsPieceModalProps {
  confirmFn: (json: any) => void;
}

const SaveAsPieceModal = forwardRef(
  (props: SaveAsPieceModalProps, ref: ForwardedRef<SaveAsPieceModalRef>) => {
    const methods = useForm();
    const onSubmit = (data: any) => {
      console.log("onsubmit", data);
      props.confirmFn(data);
    };

    const handleSubmit = methods.handleSubmit(onSubmit);

    return (
      <FormProvider {...methods}>
        <Modal
          title="Save As Piece"
          maxWidth={"md"}
          fullWidth={true}
          content={<CustomTab resetForm={methods.reset} />}
          cancelFn={() => {
            console.log("cancelFn");
          }}
          confirmFn={async () => {
            console.log("confirmFn");
            await handleSubmit();
          }}
          ref={ref}
        />
      </FormProvider>
    );
  },
);

SaveAsPieceModal.displayName = "SaveAsPieceModal";
export default SaveAsPieceModal;
