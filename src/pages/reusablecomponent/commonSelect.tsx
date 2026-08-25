import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

export type Option = {
  value: string;
  label: string;
};

export interface SelectProps {
  options: Option[];
  defaultValue?: Option;
  className?: string;
  styles?: any;
  placeholder?: string;
  handleChange?: (item: SingleValue<Option>) => void;
}

const CommonSelect: React.FC<SelectProps> = ({
  options,
  defaultValue,
  placeholder,
  className,
  handleChange = () => {},
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    defaultValue
  );

  // Sync local state with external default value
  useEffect(() => {
    if (
      !selectedOption ||
      (defaultValue &&
        (selectedOption.value !== defaultValue.value ||
          selectedOption.label !== defaultValue.label))
    ) {
      setSelectedOption(defaultValue);
    }
  }, [defaultValue]);

  const onSelectChange = (option: SingleValue<Option>) => {
    if (
      option &&
      selectedOption &&
      option.value === selectedOption.value &&
      option.label === selectedOption.label
    ) {
      return; // No change, skip update
    }

    setSelectedOption(option || undefined);
    handleChange(option);
  };

  return (
    <Select
      classNamePrefix="react-select"
      className={className}
      options={options}
      value={selectedOption}
      onChange={onSelectChange}
      placeholder={placeholder || "Select"}
    />
  );
};

export default CommonSelect;