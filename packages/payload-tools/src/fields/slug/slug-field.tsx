/* eslint-disable @stylistic/max-len */
"use client";
import {
  useField,
  Button,
  TextInput,
  FieldLabel,
  useFormFields,
  useForm
} from "@payloadcms/ui";
import { TextFieldClientProps } from "payload";
import React, { useCallback } from "react";

import { formatSlug } from "./format-slug";
import "./index.scss";

const HugeAiGenerator: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      height={24}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M11 20c-3.75 0-5.625 0-6.939-.955a5 5 0 0 1-1.106-1.106C2 16.625 2 14.749 2 11s0-5.625.955-6.939A5 5 0 0 1 4.06 2.955C5.375 2 7.251 2 11 2h.5c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C20 5.59 20 7.228 20 10.5m-2.593 3.904a.638.638 0 0 1 1.186 0l.037.093a5.1 5.1 0 0 0 2.873 2.873l.093.037a.638.638 0 0 1 0 1.186l-.093.037a5.1 5.1 0 0 0-2.873 2.873l-.037.093a.638.638 0 0 1-1.186 0l-.037-.093a5.1 5.1 0 0 0-2.873-2.873l-.093-.037a.638.638 0 0 1 0-1.186l.093-.037a5.1 5.1 0 0 0 2.873-2.873z" />
        <path d="M11 7H7v1m4-1h4v1m-4-1v8m0 0h-1m1 0h1" />
      </g>
    </svg>
  );
};
const HugeUnlock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      height={24}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1}>
        <path
          d="M4.268 18.845c.225 1.67 1.608 2.979 3.292 3.056c1.416.065 2.855.099 4.44.099s3.024-.034 4.44-.1c1.684-.076 3.067-1.385 3.292-3.055c.147-1.09.268-2.207.268-3.345s-.121-2.255-.268-3.345c-.225-1.67-1.608-2.979-3.292-3.056A95 95 0 0 0 12 9c-1.585 0-3.024.034-4.44.1c-1.684.076-3.067 1.385-3.292 3.055C4.12 13.245 4 14.362 4 15.5s.121 2.255.268 3.345Z"
          strokeWidth={1.5}
        />
        <path
          d="M7.5 9V6.5A4.5 4.5 0 0 1 12 2c1.96 0 3.5 1.5 4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
        <path
          d="M11.996 15.5h.01"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={0.9}
        />
      </g>
    </svg>
  );
};
const HugeLock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      height={24}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1}>
        <path
          d="M4.268 18.845c.225 1.67 1.608 2.979 3.292 3.056c1.416.065 2.855.099 4.44.099s3.024-.034 4.44-.1c1.684-.076 3.067-1.385 3.292-3.055c.147-1.09.268-2.207.268-3.345s-.121-2.255-.268-3.345c-.225-1.67-1.608-2.979-3.292-3.056A95 95 0 0 0 12 9c-1.585 0-3.024.034-4.44.1c-1.684.076-3.067 1.385-3.292 3.055C4.12 13.245 4 14.362 4 15.5s.121 2.255.268 3.345Z"
          strokeWidth={1.5}
        />
        <path
          d="M7.5 9V6.5a4.5 4.5 0 0 1 9 0V9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
        <path
          d="M11.996 15.5h.01"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={0.9}
        />
      </g>
    </svg>
  );
};

type SlugComponentProps = {
  fieldToUse: string
  checkboxFieldPath: string
} & TextFieldClientProps;

export const SlugComponent: React.FC<SlugComponentProps> = ({
  field,
  fieldToUse,
  checkboxFieldPath: checkboxFieldPathFromProps,
  path,
  readOnly: readOnlyFromProps,
}) => {
  const { label, } = field;

  const checkboxFieldPath = path?.includes(".")
    ? `${path}.${checkboxFieldPathFromProps}`
    : checkboxFieldPathFromProps;

  const { value, setValue, } = useField<string>({ path: path || field.name, });

  const { dispatchFields, getDataByPath, } = useForm();

  const isLocked = useFormFields(([fields]) => {
    return fields[checkboxFieldPath]?.value as string;
  });

  const handleGenerate = useCallback(
    (e: React.MouseEvent<Element>) => {
      e.preventDefault();

      const targetFieldValue = getDataByPath(fieldToUse) as string;

      if (targetFieldValue) {
        const formattedSlug = formatSlug(targetFieldValue);

        if (value !== formattedSlug) setValue(formattedSlug);
      } else {
        if (value !== "") setValue("");
      }
    }, [
      setValue,
      value,
      fieldToUse,
      getDataByPath
    ]
  );

  const handleLock = useCallback(
    (e: React.MouseEvent<Element>) => {
      e.preventDefault();

      dispatchFields({
        type: "UPDATE",
        path: checkboxFieldPath,
        value: !isLocked,
      });
    }, [
      isLocked,
      checkboxFieldPath,
      dispatchFields
    ]
  );

  return (
    <div className="field-type slug-field-component">
      <div className="label-wrapper">
        <FieldLabel htmlFor={`field-${path}`} label={label} />
        {!isLocked && (
          <Button
            buttonStyle="none"
            className="lock-button"
            onClick={handleGenerate}
          >
            <HugeAiGenerator className="icon-button" />
          </Button>
        )}
        <Button buttonStyle="none" className="lock-button" onClick={handleLock}>
          {isLocked
            ? (
              <HugeLock className="icon-button" />
            )
            : (
              <HugeUnlock className="icon-button" />
            )}
        </Button>
      </div>
      <TextInput
        onChange={setValue}
        path={path || field.name}
        readOnly={Boolean(readOnlyFromProps || isLocked)}
        value={value}
      />
    </div>
  );
};
