import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";

export type Option = {
  value: string;
  label: string;
};

export interface MultiSelectProps {
  options: Option[];
  defaultValue?: Option[];
  className?: string;
  placeholder?: string;
  handleChange?: (items: MultiValue<Option>) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  defaultValue,
  placeholder,
  className,
  handleChange,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(defaultValue || []);

  // ✅ Add "Select All" option dynamically
  const selectAllOption: Option = { label: "Select All", value: "select_all" };
  const allOptions = [selectAllOption, ...options];

  useEffect(() => {
    setSelectedOptions(defaultValue || []);
  }, [defaultValue]);

  const handleSelectChange = (newValue: MultiValue<Option>) => {
    // ✅ If "Select All" is chosen, select or clear all
    if (newValue.some((item) => item.value === "select_all")) {
      if (selectedOptions.length === options.length) {
        setSelectedOptions([]); // Deselect all
        handleChange?.([]); // Notify parent
      } else {
        setSelectedOptions(options); // Select all
        handleChange?.(options); // Notify parent
      }
    } else {
      setSelectedOptions(newValue as Option[]);
      handleChange?.(newValue);
    }
  };

  return (
    <Select
      classNamePrefix="react-select"
      className={className}
      options={allOptions}
      isMulti
      value={selectedOptions}
      onChange={handleSelectChange}
      placeholder={placeholder || "Select"}
    />
  );
};

export default MultiSelect;
