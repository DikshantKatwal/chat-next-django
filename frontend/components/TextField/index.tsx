import { ChangeEventHandler, HTMLAttributes, HTMLInputTypeAttribute, ReactNode } from "react";
import { ClassNameValue, twMerge } from "tailwind-merge";

interface TextFieldProps {
    label?: string;
    labelIcon?: ReactNode
    type?: HTMLInputTypeAttribute;
    onChange: ChangeEventHandler<HTMLInputElement>;
    className: ClassNameValue
}

const TextField = ({ label = "Label", type = "text", onChange, labelIcon, className }: TextFieldProps) => {
    return (
        <div className={twMerge(
            `relative border border-inactive rounded-sm m-1 w-full has-[input:focus]:border-light-active/50 `,
            className
        )}>
            <input
                onChange={onChange}
                type={type}
                placeholder=" "
                className="peer pt-5 pl-1 pb-1 outline-none w-full bg-transparent text-[16px]"
            />
            <label className="flex items-center text-[12px] absolute text-placeholder top-0 left-1 transition-colors peer-focus:text-light-active">
                {labelIcon}
                {label}
            </label>
        </div>
    );
};

export default TextField;
