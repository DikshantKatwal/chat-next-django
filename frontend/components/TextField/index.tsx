import { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

interface TextFieldProps {
    label?: string;
    type?: HTMLInputTypeAttribute;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

const TextField = ({ label = "Label", type = "text", onChange }: TextFieldProps) => {
    return (
        <div className="relative border border-inactive rounded-sm m-1 w-full has-[input:focus]:border-light-active/50">
            <input
                onChange={onChange}
                type={type}
                placeholder=" "
                className="peer pt-5 pl-1 pb-1 outline-none w-full bg-transparent text-[16px]"
            />
            <label className="text-[12px] absolute text-placeholder top-0 left-1 transition-colors peer-focus:text-light-active">
                {label}
            </label>
        </div>
    );
};

export default TextField;
