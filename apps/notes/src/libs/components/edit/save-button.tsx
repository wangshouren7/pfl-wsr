import { ButtonIcon, IIconButtonProps } from "@libs/components/button/icon";
import { IconSave } from "@libs/components/icon/save";
import { Dialog, DialogContent, DialogTrigger } from "@pfl-wsr/ui";
import { Button } from "../button/button";
import { IconWarn } from "../icon/warn";

export interface ISaveButtonForEditProps
  extends Omit<IIconButtonProps, "children"> {}

export const SaveButtonForEdit: React.FC<ISaveButtonForEditProps> = (props) => {
  if (props.type === "submit") {
    return (
      <ButtonIcon {...props}>
        <IconSave />
      </ButtonIcon>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ButtonIcon type="button" {...props}>
          <IconSave />
        </ButtonIcon>
      </DialogTrigger>

      <DialogContent className="flex flex-col items-center gap-[18px] rounded-2xl border-none">
        <IconWarn />

        <div className="text-secondary">Save changes ?</div>

        <div className="flex gap-9 text-xl">
          <Button type="button" variant={"danger"}>
            Discard
          </Button>

          <Button type="submit" variant={"success"}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export interface ISaveButtonForAddProps
  extends Omit<IIconButtonProps, "children"> {}

export const SaveButtonForAdd: React.FC<ISaveButtonForEditProps> = (props) => {
  return (
    <ButtonIcon {...props}>
      <IconSave />
    </ButtonIcon>
  );
};
